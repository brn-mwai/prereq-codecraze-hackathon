// ============================================
// PREREQ EXTENSION - API Client
// ============================================

import { API_BASE } from './config.js';
import { getAuthToken } from './auth.js';

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  console.log('[API] Request:', endpoint);

  const token = await getAuthToken();
  console.log('[API] Token present:', !!token);

  if (!token) {
    throw new Error('Not authenticated. Please sign in first.');
  }

  const url = `${API_BASE}${endpoint}`;
  console.log('[API] Full URL:', url);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', Object.fromEntries(response.headers.entries()));

    // Check for empty response
    const text = await response.text();
    console.log('[API] Response text length:', text.length);

    if (!text) {
      throw new Error(`Empty response from server (status: ${response.status})`);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('[API] Failed to parse JSON:', text.substring(0, 500));
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }

    console.log('[API] Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('[API] Request failed:', error);
    throw error;
  }
}

/**
 * Generate a new brief
 */
export async function generateBrief(linkedinUrl, meetingGoal = 'general') {
  const data = await apiRequest('/api/briefs/generate', {
    method: 'POST',
    body: JSON.stringify({
      linkedin_url: linkedinUrl,
      meeting_goal: meetingGoal,
    }),
  });

  return data.data;
}

/**
 * Get a brief by ID
 */
export async function getBrief(briefId) {
  const data = await apiRequest(`/api/briefs/${briefId}`);
  return data.data.brief;
}

/**
 * Get user's briefs list
 */
export async function getBriefs(options = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', options.limit);
  if (options.page) params.set('page', options.page);

  const data = await apiRequest(`/api/briefs?${params.toString()}`);
  return data.data;
}

/**
 * Save/unsave a brief
 */
export async function toggleSaveBrief(briefId, isSaved) {
  const data = await apiRequest(`/api/briefs/${briefId}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_saved: isSaved }),
  });
  return data.data.brief;
}

/**
 * Refresh a brief
 */
export async function refreshBrief(briefId, meetingGoal) {
  const data = await apiRequest(`/api/briefs/${briefId}/refresh`, {
    method: 'POST',
    body: JSON.stringify({ meeting_goal: meetingGoal }),
  });
  return data.data;
}

/**
 * Get usage stats
 */
export async function getUsage() {
  const data = await apiRequest('/api/usage');
  return data.data;
}

/**
 * Send chat message
 */
export async function sendChatMessage(message, briefId = null, sessionId = null) {
  const data = await apiRequest('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      brief_id: briefId,
      session_id: sessionId,
    }),
  });
  return data.data;
}
