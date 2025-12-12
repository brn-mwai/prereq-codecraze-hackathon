// ============================================
// PREREQ - Chat API (Sage Assistant)
// POST /api/chat
// Uses Claude as primary, Groq as fallback
// ============================================

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/auth/sync-user';
import { chat, type ChatContext } from '@/lib/ai/client';
import { successResponse, ApiErrors, withErrorHandling } from '@/lib/utils/api';
import { sanitizeString, isValidUuid } from '@/lib/utils/validation';
import type { ChatMessage, ChatResponse, Brief, MeetingGoal, User } from '@/types';
import type { Database } from '@/types/database';

type BriefRow = Database['public']['Tables']['briefs']['Row'];
type ChatSessionRow = Database['public']['Tables']['chat_sessions']['Row'];
type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // 1. Authenticate and sync user to Supabase
    const { user, error: authError } = await getOrCreateUser();
    if (authError || !user) {
      return ApiErrors.unauthorized(authError || 'Authentication failed');
    }

    // 2. Parse request body
    const body = await request.json();
    const { message, brief_id, session_id, model_id } = body;

    if (!message || typeof message !== 'string') {
      return ApiErrors.badRequest('Message is required');
    }

    const sanitizedMessage = sanitizeString(message, 2000);
    if (!sanitizedMessage) {
      return ApiErrors.badRequest('Message cannot be empty');
    }

    // Validate model_id if provided
    const selectedModel = model_id && typeof model_id === 'string' ? model_id : undefined;

    // 3. Get Supabase client for additional queries
    const supabase = createAdminClient();

    // 4. Get or create chat session
    let chatSessionId = session_id;
    let briefData: Brief | null = null;

    if (brief_id && isValidUuid(brief_id)) {
      // Fetch the brief for context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: briefResult } = await (supabase as any)
        .from('briefs')
        .select('*')
        .eq('id', brief_id)
        .eq('user_id', user.id)
        .single();

      const brief = briefResult as BriefRow | null;

      if (brief) {
        briefData = {
          id: brief.id,
          user_id: brief.user_id,
          linkedin_url: brief.linkedin_url,
          meeting_goal: brief.meeting_goal as MeetingGoal,
          profile_name: brief.profile_name,
          profile_headline: brief.profile_headline,
          profile_photo_url: brief.profile_photo_url,
          profile_location: brief.profile_location,
          profile_company: brief.profile_company,
          profile_data: brief.profile_data as Brief['profile_data'],
          summary: brief.summary,
          talking_points: brief.talking_points as string[],
          common_ground: brief.common_ground as string[],
          icebreaker: brief.icebreaker,
          questions: brief.questions as string[],
          is_saved: brief.is_saved,
          created_at: brief.created_at,
          updated_at: brief.updated_at,
        };
      }
    }

    // Get or create session
    if (chatSessionId && isValidUuid(chatSessionId)) {
      // Verify session belongs to user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingSession } = await (supabase as any)
        .from('chat_sessions')
        .select('id')
        .eq('id', chatSessionId)
        .eq('user_id', user.id)
        .single();

      if (!existingSession) {
        chatSessionId = null;
      }
    }

    if (!chatSessionId) {
      // Create new session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newSession, error: sessionError } = await (supabase as any)
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          brief_id: briefData?.id || null,
        })
        .select()
        .single();

      if (sessionError || !newSession) {
        console.error('Session create error:', sessionError);
        return ApiErrors.internalError('Failed to create chat session');
      }

      chatSessionId = newSession.id;
    }

    // 5. Get conversation history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: historyMessages } = await (supabase as any)
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', chatSessionId)
      .order('created_at', { ascending: true })
      .limit(20); // Limit context window

    const historyTyped = (historyMessages || []) as { role: string; content: string }[];
    const conversationHistory = historyTyped.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // 6. Save user message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userMessage, error: userMsgError } = await (supabase as any)
      .from('chat_messages')
      .insert({
        session_id: chatSessionId,
        role: 'user',
        content: sanitizedMessage,
      })
      .select()
      .single();

    if (userMsgError) {
      console.error('User message save error:', userMsgError);
    }

    // 7. Build context and call AI (Claude with Groq fallback)
    const chatContext: ChatContext = {
      user: {
        name: user.name || undefined,
        company: user.company || undefined,
        role: user.role || undefined,
        linkedinData: user.linkedin_data as User['linkedin_data'],
      },
      brief: briefData
        ? {
            targetName: briefData.profile_name,
            targetRole: briefData.profile_headline || '',
            targetCompany: briefData.profile_company || '',
            meetingGoal: briefData.meeting_goal,
            summary: briefData.summary,
            talking_points: briefData.talking_points,
          }
        : undefined,
      conversationHistory,
    };

    const aiResponse = await chat(sanitizedMessage, chatContext, {
      modelId: selectedModel,
    });
    const assistantResponse = aiResponse.data;

    // Log which provider and model was used
    console.log(`[Chat] Response generated using ${aiResponse.provider}${aiResponse.modelId ? ` (${aiResponse.modelId})` : ''}${aiResponse.fallbackUsed ? ' (fallback)' : ''}`);


    // 8. Save assistant message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assistantMessage, error: assistantMsgError } = await (supabase as any)
      .from('chat_messages')
      .insert({
        session_id: chatSessionId,
        role: 'assistant',
        content: assistantResponse,
      })
      .select()
      .single();

    if (assistantMsgError) {
      console.error('Assistant message save error:', assistantMsgError);
    }

    // 9. Log usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('usage_logs').insert({
      user_id: user.id,
      action: 'chat_message',
      metadata: {
        session_id: chatSessionId,
        brief_id: briefData?.id || null,
        ai_provider: aiResponse.provider,
        ai_model: aiResponse.modelId || null,
        fallback_used: aiResponse.fallbackUsed,
      },
    });

    // 10. Return response
    const response: ChatResponse = {
      message: {
        id: assistantMessage?.id || '',
        session_id: chatSessionId,
        role: 'assistant',
        content: assistantResponse,
        created_at: assistantMessage?.created_at || new Date().toISOString(),
      },
      session_id: chatSessionId,
    };

    return successResponse(response);
  });
}
