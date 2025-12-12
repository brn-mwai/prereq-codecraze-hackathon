// ============================================
// PREREQ EXTENSION - Authentication
// ============================================

import { getAuthData, setAuthData, clearAuthData, setUserData, getUserData } from './storage.js';
import { AUTH_URL, API_BASE } from './config.js';

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  console.log('[Auth] Checking authentication...');
  const auth = await getAuthData();
  console.log('[Auth] Auth data:', auth ? 'present' : 'missing');

  if (!auth || !auth.token) {
    console.log('[Auth] No token found');
    return false;
  }

  // Check if token is expired
  if (auth.expiresAt && Date.now() > auth.expiresAt) {
    console.log('[Auth] Token expired');
    await clearAuthData();
    return false;
  }

  console.log('[Auth] User is authenticated');
  return true;
}

/**
 * Get auth token
 */
export async function getAuthToken() {
  const auth = await getAuthData();
  const token = auth?.token || null;
  console.log('[Auth] Getting token:', token ? 'found' : 'not found');
  return token;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  // First try cached user data
  const cached = await getUserData();
  if (cached) return cached;

  // Otherwise fetch from API
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.user) {
        await setUserData(data.data.user);
        return data.data.user;
      }
    }
  } catch (error) {
    console.error('[Auth] Failed to fetch user:', error);
  }

  return null;
}

/**
 * Save auth token received from web app
 */
export async function saveAuthToken(token, expiresIn = 7 * 24 * 60 * 60 * 1000) {
  await setAuthData({
    token,
    expiresAt: Date.now() + expiresIn,
    savedAt: Date.now(),
  });
}

/**
 * Sign out - clear all auth data
 */
export async function signOut() {
  await clearAuthData();
}

/**
 * Open sign in page
 */
export function openSignIn() {
  chrome.tabs.create({ url: AUTH_URL });
}

/**
 * Refresh user data from API
 */
export async function refreshUserData() {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.user) {
        await setUserData(data.data.user);
        return data.data.user;
      }
    }
  } catch (error) {
    console.error('[Auth] Failed to refresh user:', error);
  }

  return null;
}
