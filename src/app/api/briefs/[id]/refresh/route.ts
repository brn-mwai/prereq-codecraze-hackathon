// ============================================
// PREREQ - Brief Refresh API
// POST /api/briefs/:id/refresh
// Uses Claude as primary, Groq as fallback
// ============================================

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/auth/sync-user';
import { fetchLinkedInProfile } from '@/lib/linkedin/client';
import { generateBrief } from '@/lib/ai/client';
import { successResponse, ApiErrors, withErrorHandling } from '@/lib/utils/api';
import { isValidUuid, isValidMeetingGoal } from '@/lib/utils/validation';
import { PLAN_LIMITS } from '@/config/constants';
import type { Brief, User, MeetingGoal } from '@/types';
import type { Database, Json } from '@/types/database';

type BriefRow = Database['public']['Tables']['briefs']['Row'];
type BriefUpdate = Database['public']['Tables']['briefs']['Update'];

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;

    // 1. Validate ID
    if (!isValidUuid(id)) {
      return ApiErrors.badRequest('Invalid brief ID');
    }

    // 2. Authenticate and sync user
    const { user, error: authError } = await getOrCreateUser();
    if (authError || !user) {
      return ApiErrors.unauthorized(authError || 'Authentication failed');
    }

    // 3. Parse optional new goal from body
    let newGoal: MeetingGoal | undefined;
    try {
      const body = await request.json();
      if (body.meeting_goal && isValidMeetingGoal(body.meeting_goal)) {
        newGoal = body.meeting_goal;
      }
    } catch {
      // No body or invalid JSON, that's fine
    }

    // 4. Get Supabase client
    const supabase = createAdminClient();

    // 5. Get existing brief
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingBriefData, error: briefError } = await (supabase as any)
      .from('briefs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (briefError || !existingBriefData) {
      return ApiErrors.notFound('Brief');
    }

    const existingBrief = existingBriefData as BriefRow;

    // 6. Check usage limits (refresh counts as a new brief)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: usageCount, error: usageError } = await (supabase as any)
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('action', ['brief_generated', 'brief_refreshed'])
      .gte('created_at', currentMonth.toISOString());

    if (usageError) {
      console.error('Usage count error:', usageError);
      return ApiErrors.internalError('Failed to check usage');
    }

    const limit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
    if ((usageCount || 0) >= limit) {
      return ApiErrors.usageLimitExceeded();
    }

    // 7. Re-fetch LinkedIn profile (get fresh data)
    const profileData = await fetchLinkedInProfile(existingBrief.linkedin_url);

    // 8. Get user's LinkedIn data for common ground
    const userLinkedInData = user.linkedin_data as User['linkedin_data'];

    // 9. Regenerate brief with AI (Claude with Groq fallback)
    const meetingGoal = newGoal || (existingBrief.meeting_goal as MeetingGoal);

    const aiResponse = await generateBrief({
      targetProfile: profileData,
      userProfile: userLinkedInData,
      meetingGoal,
      userName: user.name || undefined,
      userCompany: user.company || undefined,
      userRole: user.role || undefined,
    });

    const generatedBrief = aiResponse.data;

    // Log which provider was used
    if (aiResponse.fallbackUsed) {
      console.log(`[Brief Refresh] Generated using Groq fallback`);
    }

    // 10. Update brief in database
    const updateData: BriefUpdate = {
      meeting_goal: meetingGoal,
      profile_name: profileData.full_name,
      profile_headline: profileData.headline,
      profile_photo_url: profileData.profile_pic_url,
      profile_location: [profileData.city, profileData.state, profileData.country_full_name]
        .filter(Boolean)
        .join(', ') || null,
      profile_company: profileData.experiences?.[0]?.company || null,
      profile_data: profileData as unknown as Json,
      summary: generatedBrief.summary,
      talking_points: generatedBrief.talking_points,
      common_ground: generatedBrief.common_ground,
      icebreaker: generatedBrief.icebreaker,
      questions: generatedBrief.questions,
      updated_at: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: briefData, error: updateError } = await (supabase as any)
      .from('briefs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError || !briefData) {
      console.error('Brief update error:', updateError);
      return ApiErrors.internalError('Failed to update brief');
    }

    const brief = briefData as BriefRow;

    // 11. Log usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('usage_logs').insert({
      user_id: user.id,
      action: 'brief_refreshed',
      metadata: {
        brief_id: brief.id,
        linkedin_url: brief.linkedin_url,
        meeting_goal: meetingGoal,
        ai_provider: aiResponse.provider,
        fallback_used: aiResponse.fallbackUsed,
      },
    });

    // 12. Return updated brief
    const responseBrief: Brief = {
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

    return successResponse({ brief: responseBrief });
  });
}
