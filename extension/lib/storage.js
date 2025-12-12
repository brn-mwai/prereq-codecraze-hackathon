// ============================================
// PREREQ EXTENSION - Chrome Storage Wrapper
// ============================================

const AUTH_KEY = 'prereq_auth';
const CACHE_PREFIX = 'prereq_brief_';
const USER_KEY = 'prereq_user';

/**
 * Get auth data from storage
 */
export async function getAuthData() {
  const result = await chrome.storage.local.get(AUTH_KEY);
  return result[AUTH_KEY] || null;
}

/**
 * Save auth data to storage
 */
export async function setAuthData(data) {
  await chrome.storage.local.set({ [AUTH_KEY]: data });
}

/**
 * Clear auth data
 */
export async function clearAuthData() {
  await chrome.storage.local.remove([AUTH_KEY, USER_KEY]);
}

/**
 * Get user data from storage
 */
export async function getUserData() {
  const result = await chrome.storage.local.get(USER_KEY);
  return result[USER_KEY] || null;
}

/**
 * Save user data to storage
 */
export async function setUserData(data) {
  await chrome.storage.local.set({ [USER_KEY]: data });
}

/**
 * Cache a brief
 */
export async function cacheBrief(profileUrl, brief) {
  const key = CACHE_PREFIX + hashUrl(profileUrl);
  const data = {
    brief,
    cachedAt: Date.now(),
  };
  await chrome.storage.local.set({ [key]: data });
}

/**
 * Get cached brief
 */
export async function getCachedBrief(profileUrl) {
  const key = CACHE_PREFIX + hashUrl(profileUrl);
  const result = await chrome.storage.local.get(key);
  return result[key] || null;
}

/**
 * Clear all cached briefs
 */
export async function clearBriefCache() {
  const all = await chrome.storage.local.get();
  const cacheKeys = Object.keys(all).filter(k => k.startsWith(CACHE_PREFIX));
  if (cacheKeys.length > 0) {
    await chrome.storage.local.remove(cacheKeys);
  }
}

/**
 * Store current brief for side panel
 */
export async function setCurrentBrief(brief) {
  await chrome.storage.local.set({ prereq_current_brief: brief });
}

/**
 * Get current brief for side panel
 */
export async function getCurrentBrief() {
  const result = await chrome.storage.local.get('prereq_current_brief');
  return result.prereq_current_brief || null;
}

/**
 * Simple hash function for cache keys
 */
function hashUrl(url) {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
