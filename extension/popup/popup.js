// ============================================
// PREREQ EXTENSION - Popup
// ============================================

import { isAuthenticated, signOut, openSignIn } from '../lib/auth.js';
import { getUsage, generateBrief } from '../lib/api.js';
import { API_BASE } from '../lib/config.js';

// State
let currentGoal = 'networking';
let isGenerating = false;
let lastGeneratedBrief = null;

// DOM Elements - initialized after DOMContentLoaded
let elements = {};

// ============================================
// Initialization
// ============================================

function initializeElements() {
  elements = {
    loadingState: document.getElementById('loadingState'),
    authState: document.getElementById('authState'),
    mainContent: document.getElementById('mainContent'),
    successState: document.getElementById('successState'),
    errorState: document.getElementById('errorState'),
    mainFooter: document.getElementById('mainFooter'),
    linkedinUrl: document.getElementById('linkedinUrl'),
    urlHint: document.getElementById('urlHint'),
    clearUrl: document.getElementById('clearUrl'),
    generateBtn: document.getElementById('generateBtn'),
    generateText: document.getElementById('generateText'),
    usedCount: document.getElementById('usedCount'),
    limitCount: document.getElementById('limitCount'),
    resetDate: document.getElementById('resetDate'),
    successName: document.getElementById('successName'),
    errorMessage: document.getElementById('errorMessage'),
  };

  // Verify all elements exist
  for (const [key, el] of Object.entries(elements)) {
    if (!el) {
      console.error(`[Popup] Missing element: ${key}`);
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] DOMContentLoaded');
  initializeElements();
  setupEventListeners();
  await initPopup();
});

async function initPopup() {
  console.log('[Popup] Initializing...');
  showState('loading');

  try {
    console.log('[Popup] Checking authentication...');
    const authenticated = await isAuthenticated();
    console.log('[Popup] Authenticated:', authenticated);

    if (!authenticated) {
      console.log('[Popup] Not authenticated, showing auth state');
      showState('auth');
      return;
    }

    // Try to get current tab URL
    console.log('[Popup] Detecting LinkedIn profile...');
    await detectLinkedInProfile();

    // Load usage stats
    console.log('[Popup] Loading usage stats...');
    await loadUsage();

    console.log('[Popup] Showing main state');
    showState('main');
  } catch (error) {
    console.error('[Popup] Init error:', error);
    showState('auth');
  }
}

// ============================================
// LinkedIn Detection
// ============================================

async function detectLinkedInProfile() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab && tab.url) {
      const match = tab.url.match(/linkedin\.com\/in\/([^\/\?#]+)/);

      if (match) {
        const profileUrl = `https://www.linkedin.com/in/${match[1]}/`;
        elements.linkedinUrl.value = profileUrl;
        elements.clearUrl.classList.remove('hidden');
        elements.urlHint.textContent = 'Profile detected from current tab';
        elements.urlHint.className = 'url-hint detected';
      }
    }
  } catch (error) {
    console.log('[Popup] Could not detect profile:', error);
  }
}

// ============================================
// Usage Loading
// ============================================

async function loadUsage() {
  try {
    const usage = await getUsage();

    elements.usedCount.textContent = usage.used || 0;
    elements.limitCount.textContent = usage.limit || 10;

    if (usage.reset_date) {
      const resetDate = new Date(usage.reset_date);
      const daysUntil = Math.ceil((resetDate - new Date()) / (1000 * 60 * 60 * 24));
      elements.resetDate.textContent = daysUntil > 0 ? `in ${daysUntil} days` : 'today';
    }
  } catch (e) {
    console.log('[Popup] Could not load usage:', e);
  }
}

// ============================================
// State Management
// ============================================

function showState(state) {
  // Hide all states
  elements.loadingState.classList.add('hidden');
  elements.authState.classList.add('hidden');
  elements.mainContent.classList.add('hidden');
  elements.successState.classList.add('hidden');
  elements.errorState.classList.add('hidden');
  elements.mainFooter.classList.add('hidden');

  switch (state) {
    case 'loading':
      elements.loadingState.classList.remove('hidden');
      break;
    case 'auth':
      elements.authState.classList.remove('hidden');
      break;
    case 'main':
      elements.mainContent.classList.remove('hidden');
      elements.mainFooter.classList.remove('hidden');
      break;
    case 'success':
      elements.successState.classList.remove('hidden');
      elements.mainFooter.classList.remove('hidden');
      break;
    case 'error':
      elements.errorState.classList.remove('hidden');
      elements.mainFooter.classList.remove('hidden');
      break;
  }
}

function setGenerating(generating) {
  isGenerating = generating;
  elements.generateBtn.disabled = generating;

  if (generating) {
    elements.generateBtn.classList.add('loading');
    elements.generateBtn.innerHTML = `
      <div class="spinner"></div>
      <span>Generating...</span>
    `;
  } else {
    elements.generateBtn.classList.remove('loading');
    elements.generateBtn.innerHTML = `
      <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
      <span>Generate Brief</span>
    `;
  }
}

// ============================================
// Event Handlers
// ============================================

function setupEventListeners() {
  // Sign in
  document.getElementById('signInBtn').addEventListener('click', () => {
    openSignIn();
    window.close();
  });

  // Dashboard
  document.getElementById('dashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_BASE}/dashboard` });
    window.close();
  });

  // Settings
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_BASE}/dashboard/settings` });
    window.close();
  });

  // Sign out
  document.getElementById('signOutBtn').addEventListener('click', async () => {
    await signOut();
    showState('auth');
  });

  // URL input
  elements.linkedinUrl.addEventListener('input', () => {
    const hasValue = elements.linkedinUrl.value.trim().length > 0;
    elements.clearUrl.classList.toggle('hidden', !hasValue);

    // Validate URL
    if (hasValue) {
      const isValid = /linkedin\.com\/in\//.test(elements.linkedinUrl.value);
      if (!isValid) {
        elements.urlHint.textContent = 'Please enter a valid LinkedIn profile URL';
        elements.urlHint.className = 'url-hint error';
      } else {
        elements.urlHint.textContent = '';
        elements.urlHint.className = 'url-hint';
      }
    } else {
      elements.urlHint.textContent = '';
      elements.urlHint.className = 'url-hint';
    }
  });

  // Clear URL
  elements.clearUrl.addEventListener('click', () => {
    elements.linkedinUrl.value = '';
    elements.clearUrl.classList.add('hidden');
    elements.urlHint.textContent = '';
    elements.urlHint.className = 'url-hint';
    elements.linkedinUrl.focus();
  });

  // Goal buttons
  document.querySelectorAll('.goal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGoal = btn.dataset.goal;
    });
  });

  // Generate button
  elements.generateBtn.addEventListener('click', handleGenerate);

  // Success actions
  document.getElementById('viewBriefBtn').addEventListener('click', () => {
    if (lastGeneratedBrief?.id) {
      chrome.tabs.create({ url: `${API_BASE}/dashboard/briefs/${lastGeneratedBrief.id}` });
      window.close();
    }
  });

  document.getElementById('newBriefBtn').addEventListener('click', () => {
    elements.linkedinUrl.value = '';
    elements.clearUrl.classList.add('hidden');
    lastGeneratedBrief = null;
    showState('main');
  });

  // Retry button
  document.getElementById('retryBtn').addEventListener('click', () => {
    showState('main');
  });
}

async function handleGenerate() {
  const url = elements.linkedinUrl.value.trim();
  console.log('[Popup] Generate clicked, URL:', url, 'Goal:', currentGoal);

  if (!url) {
    elements.urlHint.textContent = 'Please enter a LinkedIn profile URL';
    elements.urlHint.className = 'url-hint error';
    elements.linkedinUrl.focus();
    return;
  }

  if (!/linkedin\.com\/in\//.test(url)) {
    elements.urlHint.textContent = 'Please enter a valid LinkedIn profile URL';
    elements.urlHint.className = 'url-hint error';
    return;
  }

  setGenerating(true);

  try {
    console.log('[Popup] Calling generateBrief API...');
    const result = await generateBrief(url, currentGoal);
    console.log('[Popup] API result:', result);

    lastGeneratedBrief = result.brief;
    console.log('[Popup] Brief generated:', lastGeneratedBrief);

    elements.successName.textContent = result.brief?.profile_name || 'Profile';
    showState('success');

    // Refresh usage
    await loadUsage();
  } catch (error) {
    console.error('[Popup] Generate error:', error);
    const errorMsg = error.message || 'Failed to generate brief';
    console.error('[Popup] Error message:', errorMsg);
    elements.errorMessage.textContent = errorMsg;
    showState('error');
  } finally {
    setGenerating(false);
  }
}
