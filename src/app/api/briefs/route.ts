// ============================================
// PREREQ - Briefs List API
// GET /api/briefs
// ============================================

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/auth/sync-user';
import { successResponse, ApiErrors, withErrorHandling, parseQueryParams } from '@/lib/utils/api';
import { validatePagination, isValidMeetingGoal } from '@/lib/utils/validation';
import { API_CONFIG } from '@/config/constants';
import type { Brief, BriefsListResponse, MeetingGoal } from '@/types';
import type { Database } from '@/types/database';

type BriefRow = Database['public']['Tables']['briefs']['Row'];

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // 1. Authenticate and sync user
    const { user, error: authError } = await getOrCreateUser();
    if (authError || !user) {
      return ApiErrors.unauthorized(authError || 'Authentication failed');
    }

    // 2. Get Supabase client
    const supabase = createAdminClient();

    // 3. Parse query parameters
    const searchParams = request.nextUrl.searchParams;

    const params = parseQueryParams(searchParams, {
      page: { type: 'number', default: 1 },
      limit: { type: 'number', default: API_CONFIG.DEFAULT_PAGE_SIZE },
      search: { type: 'string', default: '' },
      goal: { type: 'string', default: '' },
      saved: { type: 'boolean', default: false },
      sort: { type: 'string', default: 'created_at' },
      order: { type: 'string', default: 'desc' },
    });

    const { page, limit } = validatePagination(
      params.page as number,
      params.limit as number,
      API_CONFIG.MAX_PAGE_SIZE
    );

    // 4. Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('briefs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      query = query.or(
        `profile_name.ilike.${searchTerm},profile_headline.ilike.${searchTerm},profile_company.ilike.${searchTerm}`
      );
    }

    if (params.goal && isValidMeetingGoal(params.goal as string)) {
      query = query.eq('meeting_goal', params.goal);
    }

    if (params.saved) {
      query = query.eq('is_saved', true);
    }

    // Apply sorting
    const sortColumn = params.sort === 'profile_name' ? 'profile_name' : 'created_at';
    const sortOrder = params.order === 'asc' ? true : false;
    query = query.order(sortColumn, { ascending: sortOrder });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // 5. Execute query
    const { data: briefs, error: briefsError, count } = await query;

    if (briefsError) {
      console.error('Briefs query error:', briefsError);
      return ApiErrors.internalError('Failed to fetch briefs');
    }

    // 6. Transform response
    const briefsTyped = (briefs || []) as BriefRow[];
    const transformedBriefs: Brief[] = briefsTyped.map((brief) => ({
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
    }));

    const response: BriefsListResponse = {
      briefs: transformedBriefs,
      total: count || 0,
      page,
      limit,
      has_more: offset + transformedBriefs.length < (count || 0),
    };

    return successResponse(response);
  });
}
