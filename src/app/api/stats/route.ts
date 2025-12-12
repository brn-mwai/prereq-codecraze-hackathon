// ============================================
// PREREQ - Dashboard Stats API
// GET /api/stats
// ============================================

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { successResponse, ApiErrors, withErrorHandling } from '@/lib/utils/api';
import { TIME_SAVED_PER_BRIEF_MINUTES, PLAN_LIMITS } from '@/config/constants';
import type { PlanType } from '@/types';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // 1. Authenticate user
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return ApiErrors.unauthorized();
    }

    // 2. Get user from database
    const supabase = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData, error: userError } = await (supabase as any)
      .from('users')
      .select('id, plan')
      .eq('clerk_id', clerkId)
      .single();

    if (userError || !userData) {
      return ApiErrors.notFound('User');
    }

    const user = userData as { id: string; plan: PlanType };
    const userPlan = user.plan || 'free';
    const briefsLimit = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

    // 3. Get total briefs generated
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: totalBriefs, error: totalError } = await (supabase as any)
      .from('briefs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (totalError) {
      console.error('Total briefs error:', totalError);
    }

    // 4. Get briefs this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: briefsThisMonth, error: monthError } = await (supabase as any)
      .from('briefs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', currentMonth.toISOString());

    if (monthError) {
      console.error('Monthly briefs error:', monthError);
    }

    // 5. Get recent briefs (last 5)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recentBriefsData, error: recentError } = await (supabase as any)
      .from('briefs')
      .select('id, profile_name, profile_headline, profile_photo_url, meeting_goal, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Recent briefs error:', recentError);
    }

    // 6. Get recent chat sessions (last 5)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recentChatsData, error: chatsError } = await (supabase as any)
      .from('chat_sessions')
      .select('id, title, brief_id, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (chatsError) {
      console.error('Recent chats error:', chatsError);
    }

    // 7. Calculate time saved
    const timeSavedMinutes = (totalBriefs || 0) * TIME_SAVED_PER_BRIEF_MINUTES;

    // 8. Calculate remaining briefs this month
    const briefsUsedThisMonth = briefsThisMonth || 0;
    const briefsRemaining = Math.max(0, briefsLimit - briefsUsedThisMonth);

    const response = {
      briefs_generated: totalBriefs || 0,
      briefs_this_month: briefsUsedThisMonth,
      briefs_limit: briefsLimit,
      briefs_remaining: briefsRemaining,
      time_saved_minutes: timeSavedMinutes,
      meetings_prepped: totalBriefs || 0,
      plan: userPlan,
      recent_briefs: (recentBriefsData || []).map((brief: {
        id: string;
        profile_name: string;
        profile_headline: string;
        profile_photo_url: string | null;
        meeting_goal: string;
        created_at: string;
      }) => ({
        id: brief.id,
        name: brief.profile_name,
        headline: brief.profile_headline,
        photoUrl: brief.profile_photo_url,
        goal: brief.meeting_goal,
        createdAt: brief.created_at,
      })),
      recent_chats: (recentChatsData || []).map((chat: {
        id: string;
        title: string;
        brief_id: string | null;
        created_at: string;
        updated_at: string;
      }) => ({
        id: chat.id,
        title: chat.title,
        briefId: chat.brief_id,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
      })),
    };

    return successResponse(response);
  });
}
