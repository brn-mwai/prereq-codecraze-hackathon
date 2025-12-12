// ============================================
// PREREQ - User LinkedIn API
// POST /api/user/linkedin
// DELETE /api/user/linkedin
// ============================================

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/auth/sync-user';
import { fetchLinkedInProfile, normalizeLinkedInUrl } from '@/lib/linkedin/client';
import { successResponse, ApiErrors, withErrorHandling } from '@/lib/utils/api';
import { isValidLinkedInUrl } from '@/lib/utils/validation';
import type { User, PlanType, LinkedInProfileData } from '@/types';
import type { Database } from '@/types/database';

type UserRow = Database['public']['Tables']['users']['Row'];

// POST - Save and sync LinkedIn URL
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // 1. Authenticate and sync user
    const { user: currentUser, error: authError } = await getOrCreateUser();
    if (authError || !currentUser) {
      return ApiErrors.unauthorized(authError || 'Authentication failed');
    }

    // 2. Parse request body
    const body = await request.json();
    const { linkedin_url } = body;

    if (!linkedin_url || typeof linkedin_url !== 'string') {
      return ApiErrors.badRequest('LinkedIn URL is required');
    }

    if (!isValidLinkedInUrl(linkedin_url)) {
      return ApiErrors.invalidLinkedInUrl();
    }

    // 3. Normalize URL
    const normalizedUrl = normalizeLinkedInUrl(linkedin_url);

    // 4. Fetch LinkedIn profile data
    const profileData = await fetchLinkedInProfile(normalizedUrl);

    // 5. Update user in database
    const supabase = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData, error: updateError } = await (supabase as any)
      .from('users')
      .update({
        linkedin_url: normalizedUrl,
        linkedin_data: profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentUser.id)
      .select()
      .single();

    if (updateError || !userData) {
      console.error('Update error:', updateError);
      return ApiErrors.internalError('Failed to save LinkedIn profile');
    }

    const user = userData as UserRow;

    // 6. Log usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('usage_logs').insert({
      user_id: user.id,
      action: 'profile_synced',
      metadata: {
        linkedin_url: normalizedUrl,
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

    return successResponse({ user: response, message: 'LinkedIn profile connected successfully' });
  });
}

// DELETE - Disconnect LinkedIn
export async function DELETE() {
  return withErrorHandling(async () => {
    // 1. Authenticate and sync user
    const { user: currentUser, error: authError } = await getOrCreateUser();
    if (authError || !currentUser) {
      return ApiErrors.unauthorized(authError || 'Authentication failed');
    }

    // 2. Update user in database
    const supabase = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData, error: updateError } = await (supabase as any)
      .from('users')
      .update({
        linkedin_url: null,
        linkedin_data: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentUser.id)
      .select()
      .single();

    if (updateError || !userData) {
      console.error('Update error:', updateError);
      return ApiErrors.internalError('Failed to disconnect LinkedIn');
    }

    return successResponse({ message: 'LinkedIn profile disconnected' });
  });
}
