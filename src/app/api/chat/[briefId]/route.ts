// ============================================
// PREREQ - Chat History API
// GET /api/chat/:briefId
// ============================================

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/auth/sync-user';
import { successResponse, ApiErrors, withErrorHandling } from '@/lib/utils/api';
import { isValidUuid } from '@/lib/utils/validation';
import type { ChatHistoryResponse, ChatMessage, Brief, MeetingGoal } from '@/types';
import type { Database } from '@/types/database';

type BriefRow = Database['public']['Tables']['briefs']['Row'];
type ChatSessionRow = Database['public']['Tables']['chat_sessions']['Row'];
type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];

interface RouteParams {
  params: Promise<{ briefId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { briefId } = await params;

    // 1. Validate ID
    if (!isValidUuid(briefId)) {
      return ApiErrors.badRequest('Invalid brief ID');
    }

    // 2. Authenticate and sync user
    const { user, error: authError } = await getOrCreateUser();
    if (authError || !user) {
      return ApiErrors.unauthorized(authError || 'Authentication failed');
    }

    // 3. Get Supabase client
    const supabase = createAdminClient();

    // 4. Get the brief
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: briefData, error: briefError } = await (supabase as any)
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .eq('user_id', user.id)
      .single();

    if (briefError || !briefData) {
      return ApiErrors.notFound('Brief');
    }

    const brief = briefData as BriefRow;

    // 5. Get chat session for this brief
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sessionData } = await (supabase as any)
      .from('chat_sessions')
      .select('id')
      .eq('brief_id', briefId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const session = sessionData as ChatSessionRow | null;

    let messages: ChatMessage[] = [];
    let sessionId = '';

    if (session) {
      sessionId = session.id;

      // 6. Get chat messages
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: chatMessages } = await (supabase as any)
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      const messagesTyped = (chatMessages || []) as ChatMessageRow[];
      messages = messagesTyped.map((msg) => ({
        id: msg.id,
        session_id: msg.session_id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        created_at: msg.created_at,
      }));
    }

    // 7. Transform brief
    const transformedBrief: Brief = {
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

    const response: ChatHistoryResponse = {
      messages,
      session_id: sessionId,
      brief: transformedBrief,
    };

    return successResponse(response);
  });
}
