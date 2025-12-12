// ============================================
// PREREQ - Brief Generation API
// POST /api/briefs/generate
// Uses Claude as primary, Groq as fallback
// ============================================

import { NextRequest, NextResponse } from 'next/server';

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/auth/sync-user';
import { fetchLinkedInProfile } from '@/lib/linkedin/client';
import { generateBrief } from '@/lib/ai/client';
import { successResponse, ApiErrors, withErrorHandling } from '@/lib/utils/api';
import { validateBriefGenerationRequest } from '@/lib/utils/validation';
import { PLAN_LIMITS } from '@/config/constants';
import type { Brief, User, MeetingGoal } from '@/types';
import type { Database } from '@/types/database';

type BriefRow = Database['public']['Tables']['briefs']['Row'];

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // 1. Authenticate and sync user
    const { user, error: authError } = await getOrCreateUser();
    if (authError || !user) {
      return ApiErrors.unauthorized(authError || 'Authentication failed');
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = validateBriefGenerationRequest(body);

    if (!validation.isValid || !validation.data) {
      return ApiErrors.badRequest(validation.errors.join(', '));
    }

    const { linkedin_url, meeting_goal } = validation.data;

    // 3. Get Supabase client
    const supabase = createAdminClient();

    // 4. Check usage limits
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: usageCount, error: usageError } = await (supabase as any)
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action', 'brief_generated')
      .gte('created_at', currentMonth.toISOString());

    if (usageError) {
      console.error('Usage count error:', usageError);
      return ApiErrors.internalError('Failed to check usage');
    }

    const limit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
    if ((usageCount || 0) >= limit) {
      return ApiErrors.usageLimitExceeded();
    }

    // 5. Fetch LinkedIn profile data
    const profileData = await fetchLinkedInProfile(linkedin_url);

    // 6. Get user's LinkedIn data for common ground (if available)
    const userLinkedInData = user.linkedin_data as User['linkedin_data'];

    // 7. Generate brief using AI (Claude with Groq fallback)
    const aiResponse = await generateBrief({
      targetProfile: profileData,
      userProfile: userLinkedInData,
      meetingGoal: meeting_goal,
      userName: user.name || undefined,
      userCompany: user.company || undefined,
      userRole: user.role || undefined,
    });

    const generatedBrief = aiResponse.data;

    // Log which provider was used
    if (aiResponse.fallbackUsed) {
      console.log(`[Brief ${meeting_goal}] Generated using Groq fallback`);
    }

    // 8. Save brief to database (include enhanced insights in profile_data)
    const enhancedProfileData = {
      ...profileData,
      enhanced_insights: {
        personality_insights: generatedBrief.personality_insights,
        communication_style: generatedBrief.communication_style,
        rapport_tips: generatedBrief.rapport_tips,
        potential_challenges: generatedBrief.potential_challenges,
        meeting_strategy: generatedBrief.meeting_strategy,
        follow_up_hooks: generatedBrief.follow_up_hooks,
        linkedin_dm_template: generatedBrief.linkedin_dm_template,
        email_template: generatedBrief.email_template,
      },
    };

    const briefData = {
      user_id: user.id,
      linkedin_url,
      meeting_goal,
      profile_name: profileData.full_name,
      profile_headline: profileData.headline,
      profile_photo_url: profileData.profile_pic_url,
      profile_location: [profileData.city, profileData.state, profileData.country_full_name]
        .filter(Boolean)
        .join(', ') || null,
      profile_company: profileData.experiences?.[0]?.company || null,
      profile_data: enhancedProfileData,
      summary: generatedBrief.summary,
      talking_points: generatedBrief.talking_points,
      common_ground: generatedBrief.common_ground,
      icebreaker: generatedBrief.icebreaker,
      questions: generatedBrief.questions,
      is_saved: false,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: briefResult, error: briefError } = await (supabase as any)
      .from('briefs')
      .insert(briefData)
      .select()
      .single();

    if (briefError || !briefResult) {
      console.error('Brief insert error:', briefError);
      return ApiErrors.internalError('Failed to save brief');
    }

    const brief = briefResult as BriefRow;

    // 9. Log usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('usage_logs').insert({
      user_id: user.id,
      action: 'brief_generated',
      metadata: {
        brief_id: brief.id,
        linkedin_url,
        meeting_goal,
        ai_provider: aiResponse.provider,
        fallback_used: aiResponse.fallbackUsed,
      },
    });

    // 10. Return the brief
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

    return successResponse({ brief: responseBrief }, 201);
  });
}
