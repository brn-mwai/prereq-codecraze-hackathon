// ============================================
// PREREQ - User Sync Utility
// Syncs Clerk users to Supabase on first request
// Supports both cookie-based and Bearer token auth
// ============================================

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { verifyToken } from '@clerk/backend';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/server';
import type { User, PlanType, LinkedInProfileData } from '@/types';

export interface SyncedUser {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: string | null;
  linkedin_url: string | null;
  linkedin_data: LinkedInProfileData | null;
  plan: PlanType;
  created_at: string;
  updated_at: string;
}

export interface SyncResult {
  user: SyncedUser | null;
  error: string | null;
  created: boolean;
}

/**
 * Gets the authenticated user from Supabase, creating them if they don't exist.
 * This ensures Clerk users are always synced to Supabase on their first API request.
 * Supports both cookie-based auth and Bearer token auth (for Chrome extension).
 */
export async function getOrCreateUser(): Promise<SyncResult> {
  // 1. Try to get Clerk auth from cookie first
  let clerkId: string | null = null;

  // Check for Bearer token in Authorization header (for extension)
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    try {
      // Verify the Bearer token
      const verifiedToken = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      clerkId = verifiedToken.sub || null;
    } catch (error) {
      console.error('[Auth] Bearer token verification failed:', error);
      // Fall through to try cookie-based auth
    }
  }

  // If no Bearer token or verification failed, try cookie-based auth
  if (!clerkId) {
    const authResult = await auth();
    clerkId = authResult.userId;
  }

  if (!clerkId) {
    return { user: null, error: 'Not authenticated', created: false };
  }

  const supabase = createAdminClient();

  // 2. Try to get existing user from Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingUser, error: fetchError } = await (supabase as any)
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (existingUser) {
    // User exists, return them
    return {
      user: transformUser(existingUser),
      error: null,
      created: false,
    };
  }

  // 3. User doesn't exist in Supabase, get data from Clerk and create them
  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 = "not found", which is expected. Other errors are real errors.
    console.error('Error fetching user:', fetchError);
    return { user: null, error: 'Database error', created: false };
  }

  // 4. Get user data from Clerk
  // Try currentUser() first (works for cookie-based auth)
  // Fall back to clerkClient.users.getUser() for Bearer token auth
  let email: string | null = null;
  let name: string | null = null;

  const clerkUser = await currentUser();

  if (clerkUser) {
    email = clerkUser.emailAddresses?.[0]?.emailAddress || null;
    name = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(' ') || null;
  } else {
    // Fetch user data from Clerk backend API (for Bearer token auth)
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkId);
      email = user.emailAddresses?.[0]?.emailAddress || null;
      name = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(' ') || null;
    } catch (error) {
      console.error('[Auth] Failed to fetch user from Clerk API:', error);
      return { user: null, error: 'Could not fetch user from Clerk', created: false };
    }
  }

  if (!email) {
    return { user: null, error: 'User has no email address', created: false };
  }

  // 5. Create user in Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newUser, error: insertError } = await (supabase as any)
    .from('users')
    .insert({
      clerk_id: clerkId,
      email,
      name,
      plan: 'free',
    })
    .select()
    .single();

  if (insertError) {
    // Handle race condition - user might have been created by webhook
    if (insertError.code === '23505') {
      // Duplicate key - try fetching again
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: retryUser } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (retryUser) {
        return {
          user: transformUser(retryUser),
          error: null,
          created: false,
        };
      }
    }

    console.error('Error creating user:', insertError);
    return { user: null, error: 'Failed to create user', created: false };
  }

  console.log(`[Auth] Created new user in Supabase: ${clerkId}`);

  return {
    user: transformUser(newUser),
    error: null,
    created: true,
  };
}

/**
 * Transform database row to typed User object
 */
function transformUser(dbUser: Record<string, unknown>): SyncedUser {
  return {
    id: dbUser.id as string,
    clerk_id: dbUser.clerk_id as string,
    email: dbUser.email as string,
    name: dbUser.name as string | null,
    company: dbUser.company as string | null,
    role: dbUser.role as string | null,
    linkedin_url: dbUser.linkedin_url as string | null,
    linkedin_data: dbUser.linkedin_data as LinkedInProfileData | null,
    plan: dbUser.plan as PlanType,
    created_at: dbUser.created_at as string,
    updated_at: dbUser.updated_at as string,
  };
}

/**
 * Simple check if user is authenticated (doesn't create user)
 */
export async function requireAuth(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
