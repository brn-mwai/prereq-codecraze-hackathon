// ============================================
// PREREQ - Usage Stats API
// GET /api/usage
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
import { getOrCreateUser } from '@/lib/auth/sync-user';
import { createAdminClient } from '@/lib/supabase/server';
import { successResponse, ApiErrors, withErrorHandling } from '@/lib/utils/api';
import { PLAN_LIMITS } from '@/config/constants';
import type { UsageStats, PlanType } from '@/types';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // 1. Authenticate user (supports both cookie and Bearer token auth)
    const { user, error } = await getOrCreateUser();
    if (error || !user) {
      return ApiErrors.unauthorized(error || 'Not authenticated');
    }

    // 2. Calculate current billing period
    const supabase = createAdminClient();
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // 3. Count usage for current period
    const { count: usageCount, error: usageError } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('action', ['brief_generated', 'brief_refreshed'])
      .gte('created_at', currentMonth.toISOString())
      .lt('created_at', nextMonth.toISOString());

    if (usageError) {
      console.error('Usage count error:', usageError);
      return ApiErrors.internalError('Failed to fetch usage');
    }

    const limit = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
    const used = usageCount || 0;

    const response: UsageStats = {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      reset_date: nextMonth.toISOString(),
      plan: user.plan,
    };

    return successResponse(response);
  });
}
