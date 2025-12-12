// ============================================
// PREREQ - LinkedIn Re-sync API
// POST /api/user/linkedin/sync
// ============================================

import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/auth/sync-user';
import { fetchLinkedInProfile } from '@/lib/linkedin/client';
import { successResponse, ApiErrors, withErrorHandling } from '@/lib/utils/api';
import type { User, PlanType, LinkedInProfileData } from '@/types';
import type { Database } from '@/types/database';

type UserRow = Database['public']['Tables']['users']['Row'];

export async function POST() {
  return withErrorHandling(async () => {
    // 1. Authenticate and sync user
    const { user: existingUser, error: authError } = await getOrCreateUser();
    if (authError || !existingUser) {
      return ApiErrors.unauthorized(authError || 'Authentication failed');
    }

    // 2. Check if user has LinkedIn URL
    if (!existingUser.linkedin_url) {
      return ApiErrors.badRequest('No LinkedIn profile connected. Please connect your LinkedIn first.');
    }

    // 3. Re-fetch LinkedIn profile data
    const profileData = await fetchLinkedInProfile(existingUser.linkedin_url);

    // 4. Update user in database
    const supabase = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData, error: updateError } = await (supabase as any)
      .from('users')
      .update({
        linkedin_data: profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingUser.id)
      .select()
      .single();

    if (updateError || !userData) {
      console.error('Update error:', updateError);
      return ApiErrors.internalError('Failed to sync LinkedIn profile');
    }

    const user = userData as UserRow;

    // 6. Log usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('usage_logs').insert({
      user_id: user.id,
      action: 'profile_synced',
      metadata: {
        linkedin_url: user.linkedin_url,
        is_resync: true,
      },
    });

    // 7. Transform and return
    const response: User = {
      id: user.id,
      clerk_id: user.clerk_id,
      email: user.email,
      name: user.name,
      company: user.company,
      role: user.role,
      linkedin_url: user.linkedin_url,
      linkedin_data: user.linkedin_data as LinkedInProfileData | null,
      plan: user.plan as PlanType,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return successResponse({ user: response, message: 'LinkedIn profile synced successfully' });
  });
}
