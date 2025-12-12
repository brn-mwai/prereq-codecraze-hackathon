// ============================================
// PREREQ - Single Brief API
// GET /api/briefs/:id
// PATCH /api/briefs/:id
// DELETE /api/briefs/:id
// ============================================

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/auth/sync-user';
import { successResponse, ApiErrors, withErrorHandling } from '@/lib/utils/api';
import { isValidUuid } from '@/lib/utils/validation';
import type { Brief, MeetingGoal } from '@/types';
import type { Database } from '@/types/database';

type BriefRow = Database['public']['Tables']['briefs']['Row'];

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single brief
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // 3. Get Supabase client
    const supabase = createAdminClient();

    // 4. Fetch brief
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: briefData, error: briefError } = await (supabase as any)
      .from('briefs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (briefError || !briefData) {
      return ApiErrors.notFound('Brief');
    }

    const brief = briefData as BriefRow;

    // 5. Transform and return
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

    return successResponse({ brief: transformedBrief });
  });
}

// PATCH - Update brief (save/unsave)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // 3. Parse request body
    const body = await request.json();
    const { is_saved } = body;

    if (typeof is_saved !== 'boolean') {
      return ApiErrors.badRequest('is_saved must be a boolean');
    }

    // 4. Get Supabase client and update brief
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: briefData, error: updateError } = await (supabase as any)
      .from('briefs')
      .update({
        is_saved,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError || !briefData) {
      return ApiErrors.notFound('Brief');
    }

    const brief = briefData as BriefRow;

    // 6. Transform and return
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

    return successResponse({ brief: transformedBrief });
  });
}

// DELETE - Delete brief
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // 3. Get Supabase client
    const supabase = createAdminClient();

    // 4. Delete brief
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('briefs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return ApiErrors.internalError('Failed to delete brief');
    }

    return successResponse({ message: 'Brief deleted successfully' });
  });
}
