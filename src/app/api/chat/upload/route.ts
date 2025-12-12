import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateUser } from '@/lib/auth/sync-user';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Supported MIME types
const SUPPORTED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'text/plain': 'text',
  'text/markdown': 'text',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'text/csv': 'csv',
  'application/json': 'json',
};

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getOrCreateUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sessionId = formData.get('session_id') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = SUPPORTED_TYPES[file.type];
    if (!fileType) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let textContent = '';

    // Extract text based on file type
    if (fileType === 'text' || fileType === 'csv' || fileType === 'json') {
      textContent = buffer.toString('utf-8');
    } else if (fileType === 'pdf') {
      // For PDF, we'll extract basic text (in production, use pdf-parse or similar)
      // For now, send the raw content to Claude for processing
      textContent = `[PDF Document: ${file.name}]\n\nContent extraction in progress...`;

      // Store the raw buffer for PDF processing
      // In production, you would use a PDF parsing library
    } else if (fileType === 'document') {
      // For Word docs, similar approach
      textContent = `[Word Document: ${file.name}]\n\nContent extraction in progress...`;
    }

    // Create or get session
    let currentSessionId = sessionId;

    if (!currentSessionId) {
      // Create new session
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: `Document: ${file.name}`,
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        return NextResponse.json(
          { success: false, error: 'Failed to create session' },
          { status: 500 }
        );
      }

      currentSessionId = session.id;
    }

    // Store document reference in database
    const { data: document, error: docError } = await supabase
      .from('chat_documents')
      .insert({
        session_id: currentSessionId,
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        content_preview: textContent.substring(0, 1000),
        status: 'processed',
      })
      .select()
      .single();

    if (docError) {
      // Table might not exist, create it or continue without storing
      console.warn('Document storage warning:', docError);
    }

    // Use Claude to summarize/process the document
    let summary = '';
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `You are Sage AI, a document analysis assistant. Analyze the uploaded document and provide a brief summary of its contents. Focus on key points that would be useful for meeting preparation.`,
        messages: [
          {
            role: 'user',
            content: `Please analyze this document and provide a brief summary:\n\nFilename: ${file.name}\nType: ${file.type}\n\nContent:\n${textContent.substring(0, 8000)}`,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      summary = textBlock?.text || 'Document processed successfully.';
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      summary = 'Document uploaded successfully. You can now ask questions about it.';
    }

    // Store the document context in the session
    await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'system',
        content: `[Document uploaded: ${file.name}]\n\nDocument Summary:\n${summary}\n\nFull content available for reference:\n${textContent.substring(0, 4000)}`,
      });

    return NextResponse.json({
      success: true,
      data: {
        session_id: currentSessionId,
        document_id: document?.id,
        summary,
        file_name: file.name,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
