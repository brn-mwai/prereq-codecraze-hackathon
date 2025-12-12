// ============================================
// PREREQ EXTENSION - Background Service Worker
// ============================================

import { isAuthenticated, getAuthToken, openSignIn, saveAuthToken } from '../lib/auth.js';
import { generateBrief, refreshBrief as refreshBriefApi } from '../lib/api.js';
import {
  cacheBrief,
  getCachedBrief,
  setCurrentBrief,
  getCurrentBrief,
} from '../lib/storage.js';
import { CACHE_DURATION, API_BASE } from '../lib/config.js';

// ============================================
// Message Handlers
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch(error => {
      console.error('[Background] Error:', error);
      sendResponse({ success: false, error: error.message });
    });

  // Return true to indicate async response
  return true;
});

async function handleMessage(message, sender) {
  console.log('[Background] Message received:', message.action);

  switch (message.action) {
    case 'generateBrief':
      return await handleGenerateBrief(message.profileUrl, message.meetingGoal);

    case 'refreshBrief':
      return await handleRefreshBrief(message.briefId, message.meetingGoal);

    case 'openSidePanel':
      return await handleOpenSidePanel(sender.tab?.id);

    case 'openSignIn':
      openSignIn();
      return { success: true };

    case 'checkAuth':
      return { isAuthenticated: await isAuthenticated() };

    case 'getBriefData':
      const brief = await getCurrentBrief();
      return { brief };

    case 'saveAuthToken':
      await saveAuthToken(message.token);
      return { success: true };

    default:
      return { error: 'Unknown action' };
  }
}

// ============================================
// Brief Generation
// ============================================

async function handleGenerateBrief(profileUrl, meetingGoal = 'general') {
  // Check authentication
  if (!await isAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check cache first
  const cached = await getCachedBrief(profileUrl);
  if (cached && !isCacheExpired(cached)) {
    console.log('[Background] Using cached brief');
    await setCurrentBrief(cached.brief);
    return { success: true, brief: cached.brief, fromCache: true };
  }

  try {
    console.log('[Background] Generating new brief for:', profileUrl);

    // Call API to generate brief
    const result = await generateBrief(profileUrl, meetingGoal);
    const brief = result.brief;

    // Cache the brief
    await cacheBrief(profileUrl, brief);
    await setCurrentBrief(brief);

    console.log('[Background] Brief generated successfully');
    return { success: true, brief };
  } catch (error) {
    console.error('[Background] Generate error:', error);
    return { success: false, error: error.message };
  }
}

async function handleRefreshBrief(briefId, meetingGoal) {
  if (!await isAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const result = await refreshBriefApi(briefId, meetingGoal);
    const brief = result.brief;

    // Update current brief
    await setCurrentBrief(brief);

    // Notify side panel
    chrome.runtime.sendMessage({ action: 'briefUpdated' }).catch(() => {});

    return { success: true, brief };
  } catch (error) {
    console.error('[Background] Refresh error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// Side Panel
// ============================================

async function handleOpenSidePanel(tabId) {
  if (!tabId) {
    return { success: false, error: 'No tab ID' };
  }

  try {
    await chrome.sidePanel.open({ tabId });
    return { success: true };
  } catch (error) {
    console.error('[Background] SidePanel error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// Extension Lifecycle
// ============================================

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Background] Extension installed:', details.reason);

  if (details.reason === 'install') {
    // Open onboarding page on first install
    chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding/index.html'),
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This won't fire because we have a popup, but keep for reference
  console.log('[Background] Extension icon clicked');
});

// ============================================
// Auth Message from Web App
// ============================================

// Listen for messages from the web app auth page
chrome.runtime.onMessageExternal.addListener(
  async (message, sender, sendResponse) => {
    console.log('[Background] External message:', message);

    // Verify sender is our app
    const allowedOrigins = [
      'https://prereq.brianmwai.com',
      'http://localhost:3000',
    ];

    if (!allowedOrigins.some(origin => sender.origin?.startsWith(origin))) {
      console.log('[Background] Rejected message from:', sender.origin);
      return;
    }

    if (message.type === 'PREREQ_AUTH_TOKEN' && message.token) {
      console.log('[Background] Received auth token');
      await saveAuthToken(message.token);
      sendResponse({ success: true });

      // Close the auth tab
      if (sender.tab?.id) {
        chrome.tabs.remove(sender.tab.id).catch(() => {});
      }
    }
  }
);

// ============================================
// Utilities
// ============================================

function isCacheExpired(cached) {
  if (!cached || !cached.cachedAt) return true;
  return Date.now() - cached.cachedAt > CACHE_DURATION;
}

// Log startup
console.log('[Background] Prereq extension service worker started');
