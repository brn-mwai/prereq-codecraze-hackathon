// ============================================
// PREREQ - User Profile API
// GET /api/user/profile
// PUT /api/user/profile
// ============================================

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/auth/sync-user';
import { successResponse, ApiErrors, withErrorHandling } from '@/lib/utils/api';
import { sanitizeString } from '@/lib/utils/validation';
import type { User, PlanType, LinkedInProfileData } from '@/types';
import type { Database } from '@/types/database';

type UserRow = Database['public']['Tables']['users']['Row'];

// GET - Fetch user profile (auto-creates if doesn't exist)
export async function GET() {
  return withErrorHandling(async () => {
    // 1. Authenticate and sync user
    const { user, error: authError, created } = await getOrCreateUser();
    if (authError || !user) {
      return ApiErrors.unauthorized(authError || 'Authentication failed');
    }

    if (created) {
      console.log('[Profile] Auto-created user on first profile fetch');
    }

    // 2. Return user profile
    const response: User = {
      id: user.id,
      clerk_id: user.clerk_id,
      email: user.email,
      name: user.name,
      company: user.company,
      role: user.role,
      linkedin_url: user.linkedin_url,
      linkedin_data: user.linkedin_data,
      plan: user.plan,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return successResponse({ user: response });
  });
}

// Helper function for updating profile
async function updateProfile(request: NextRequest) {
  return withErrorHandling(async () => {
    // 1. Authenticate and sync user
    const { user: currentUser, error: authError } = await getOrCreateUser();
    if (authError || !currentUser) {
      return ApiErrors.unauthorized(authError || 'Authentication failed');
    }

    // 2. Parse request body
    const body = await request.json();
    const { full_name, name, company, role, linkedin_url } = body;

    // 3. Build update object with sanitized values
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Support both 'full_name' and 'name' fields
    const nameValue = full_name !== undefined ? full_name : name;
    if (nameValue !== undefined) {
      updates.name = nameValue ? sanitizeString(nameValue, 255) : null;
    }

    if (company !== undefined) {
      updates.company = company ? sanitizeString(company, 255) : null;
    }

    if (role !== undefined) {
      updates.role = role ? sanitizeString(role, 255) : null;
    }

    if (linkedin_url !== undefined) {
      updates.linkedin_url = linkedin_url ? sanitizeString(linkedin_url, 500) : null;
    }

    // 4. Update user in database
    const supabase = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData, error: updateError } = await (supabase as any)
      .from('users')
      .update(updates)
      .eq('id', currentUser.id)
      .select()
      .single();

    if (updateError || !userData) {
      console.error('Update error:', updateError);
      return ApiErrors.internalError('Failed to update profile');
    }

    const updatedUser = userData as UserRow;

    // 5. Transform and return
    const response: User = {
      id: updatedUser.id,
      clerk_id: updatedUser.clerk_id,
      email: updatedUser.email,
      name: updatedUser.name,
      company: updatedUser.company,
      role: updatedUser.role,
      linkedin_url: updatedUser.linkedin_url,
      linkedin_data: updatedUser.linkedin_data as LinkedInProfileData | null,
      plan: updatedUser.plan as PlanType,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    };

    return successResponse({ user: response });
  });
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  return updateProfile(request);
}

// PATCH - Update user profile (alias for PUT)
export async function PATCH(request: NextRequest) {
  return updateProfile(request);
}
