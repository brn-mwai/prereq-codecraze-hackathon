// ============================================
// PREREQ EXTENSION - Side Panel
// ============================================

import { getCurrentBrief, setCurrentBrief } from '../lib/storage.js';
import { isAuthenticated, openSignIn } from '../lib/auth.js';
import { toggleSaveBrief, refreshBrief } from '../lib/api.js';
import { API_BASE } from '../lib/config.js';
import { initSageOrb } from '../lib/sage-orb.js';

let currentBriefData = null;
let currentGoal = 'networking';
let customGoalText = '';
let loadingOrb = null;
let sageOrb = null;

// DOM Elements
const elements = {
  loadingState: document.getElementById('loadingState'),
  authState: document.getElementById('authState'),
  emptyState: document.getElementById('emptyState'),
  errorState: document.getElementById('errorState'),
  briefContent: document.getElementById('briefContent'),
  errorMessage: document.getElementById('errorMessage'),
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toastMessage'),
  customGoalInput: document.getElementById('customGoalInput'),
  customGoalText: document.getElementById('customGoalText'),
  customGoalBtn: document.getElementById('customGoalBtn'),
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize orbs
  await initializeOrbs();
  await loadBrief();
  setupEventListeners();
});

async function initializeOrbs() {
  // Loading state orb
  const loadingCanvas = document.getElementById('loadingOrb');
  if (loadingCanvas) {
    loadingOrb = await initSageOrb(loadingCanvas, {
      size: 56,
      initialState: 'thinking',
    });
  }

  // Sage section orb
  const sageCanvas = document.getElementById('sageOrb');
  if (sageCanvas) {
    sageOrb = await initSageOrb(sageCanvas, {
      size: 28,
      initialState: 'idle',
    });
  }
}

// Listen for brief updates from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'briefUpdated') {
    loadBrief();
  }
});

// ============================================
// Brief Loading
// ============================================

async function loadBrief() {
  showState('loading');

  try {
    // Check auth first
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      showState('auth');
      return;
    }

    // Get current brief
    const brief = await getCurrentBrief();
    if (!brief) {
      showState('empty');
      return;
    }

    currentBriefData = brief;
    currentGoal = brief.meeting_goal || 'networking';
    renderBrief(brief);
    showState('content');
  } catch (error) {
    console.error('[SidePanel] Error loading brief:', error);
    showError(error.message);
  }
}

// ============================================
// Rendering
// ============================================

function renderBrief(brief) {
  // Profile header
  const photoEl = document.getElementById('profilePhoto');
  photoEl.src = brief.profile_photo_url || getDefaultAvatar(brief.profile_name);
  photoEl.onerror = () => {
    photoEl.src = getDefaultAvatar(brief.profile_name);
  };

  document.getElementById('profileName').textContent = brief.profile_name || 'Unknown';
  document.getElementById('profileHeadline').textContent = brief.profile_headline || '';
  document.getElementById('profileLocation').textContent = brief.profile_location || '';
  document.getElementById('profileCompany').textContent = brief.profile_company || '';

  // Goal selector - check if it's a custom goal
  const savedGoal = brief.meeting_goal || 'networking';
  const isPresetGoal = ['networking', 'sales', 'hiring', 'investor'].includes(savedGoal);

  if (isPresetGoal) {
    customGoalText = '';
    updateGoalSelector(savedGoal);
  } else {
    customGoalText = savedGoal;
    updateGoalSelector('custom', savedGoal);
  }

  // Summary
  document.getElementById('summaryContent').textContent = brief.summary || 'No summary available.';

  // Talking points
  renderList('talkingPointsList', brief.talking_points || []);

  // Common ground
  renderList('commonGroundList', brief.common_ground || []);

  // Icebreaker
  document.getElementById('icebreakerContent').textContent = brief.icebreaker || 'No icebreaker available.';

  // Questions
  renderList('questionsList', brief.questions || []);

  // Save button
  updateSaveButton(brief.is_saved);
}

function renderList(elementId, items) {
  const list = document.getElementById(elementId);
  if (!items || items.length === 0) {
    list.innerHTML = '<li class="empty-item">None available</li>';
    return;
  }
  list.innerHTML = items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
}

function updateGoalSelector(goal, customText = '') {
  const buttons = document.querySelectorAll('.goal-btn');
  const isCustom = goal === 'custom' || (customText && !['networking', 'sales', 'hiring', 'investor'].includes(goal));

  buttons.forEach(btn => {
    const isActive = isCustom ? btn.dataset.goal === 'custom' : btn.dataset.goal === goal;
    btn.classList.toggle('active', isActive);
    btn.classList.remove('has-custom-text');
  });

  // Update custom button text if custom goal is active
  if (isCustom && customText && elements.customGoalBtn) {
    elements.customGoalBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      ${customText.length > 12 ? customText.substring(0, 12) + '...' : customText}
    `;
    elements.customGoalBtn.classList.add('has-custom-text');
  } else if (elements.customGoalBtn) {
    elements.customGoalBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Custom
    `;
  }
}

function updateSaveButton(isSaved) {
  const icon = document.getElementById('saveIcon');
  const text = document.getElementById('saveText');
  icon.textContent = isSaved ? '★' : '☆';
  text.textContent = isSaved ? 'Saved' : 'Save';
}

// ============================================
// State Management
// ============================================

function showState(state) {
  // Hide all states
  elements.loadingState.classList.add('hidden');
  elements.authState.classList.add('hidden');
  elements.emptyState.classList.add('hidden');
  elements.errorState.classList.add('hidden');
  elements.briefContent.classList.add('hidden');

  // Show requested state
  switch (state) {
    case 'loading':
      elements.loadingState.classList.remove('hidden');
      if (loadingOrb) loadingOrb.setThinking();
      break;
    case 'auth':
      elements.authState.classList.remove('hidden');
      if (loadingOrb) loadingOrb.setIdle();
      break;
    case 'empty':
      elements.emptyState.classList.remove('hidden');
      if (loadingOrb) loadingOrb.setIdle();
      break;
    case 'error':
      elements.errorState.classList.remove('hidden');
      if (loadingOrb) loadingOrb.setIdle();
      break;
    case 'content':
      elements.briefContent.classList.remove('hidden');
      if (loadingOrb) loadingOrb.setIdle();
      if (sageOrb) sageOrb.setIdle();
      break;
  }
}

function showError(message) {
  elements.errorMessage.textContent = message || 'Something went wrong';
  showState('error');
}

function showToast(message) {
  elements.toastMessage.textContent = message;
  elements.toast.classList.remove('hidden');
  setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 2000);
}

// ============================================
// Event Handlers
// ============================================

function setupEventListeners() {
  // Sign in button
  document.getElementById('signInBtn').addEventListener('click', () => {
    openSignIn();
  });

  // Retry button
  document.getElementById('retryBtn').addEventListener('click', () => {
    loadBrief();
  });

  // Refresh button
  document.getElementById('refreshBtn').addEventListener('click', handleRefresh);

  // Open dashboard
  document.getElementById('openDashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_BASE}/dashboard` });
  });

  // Goal selector
  document.querySelectorAll('.goal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.goal === 'custom') {
        showCustomGoalInput();
      } else {
        handleGoalChange(btn.dataset.goal);
      }
    });
  });

  // Custom goal input handlers
  document.getElementById('cancelCustomGoal').addEventListener('click', hideCustomGoalInput);
  document.getElementById('applyCustomGoal').addEventListener('click', applyCustomGoal);
  elements.customGoalText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applyCustomGoal();
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => copySection(btn.dataset.section));
  });

  // Copy all
  document.getElementById('copyAllBtn').addEventListener('click', copyAll);

  // Save button
  document.getElementById('saveBtn').addEventListener('click', handleSave);
}

async function handleRefresh() {
  if (!currentBriefData) return;

  showState('loading');

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'refreshBrief',
      briefId: currentBriefData.id,
      meetingGoal: currentGoal,
    });

    if (response.success) {
      await loadBrief();
      showToast('Brief refreshed!');
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('[SidePanel] Refresh error:', error);
    showError(error.message);
  }
}

async function handleGoalChange(goal) {
  if (goal === currentGoal || !currentBriefData) return;

  currentGoal = goal;
  customGoalText = '';
  updateGoalSelector(goal);
  hideCustomGoalInput();

  // Refresh brief with new goal
  await handleRefresh();
}

function showCustomGoalInput() {
  elements.customGoalInput.classList.remove('hidden');
  elements.customGoalText.value = customGoalText;
  elements.customGoalText.focus();
}

function hideCustomGoalInput() {
  elements.customGoalInput.classList.add('hidden');
  elements.customGoalText.value = '';
}

async function applyCustomGoal() {
  const text = elements.customGoalText.value.trim();
  if (!text) {
    showToast('Please enter a custom goal');
    return;
  }

  customGoalText = text;
  currentGoal = text; // Use the custom text as the goal
  updateGoalSelector('custom', text);
  hideCustomGoalInput();

  // Refresh brief with custom goal
  if (currentBriefData) {
    await handleRefresh();
  }
}

async function handleSave() {
  if (!currentBriefData) return;

  try {
    const newSavedState = !currentBriefData.is_saved;
    const updated = await toggleSaveBrief(currentBriefData.id, newSavedState);

    currentBriefData.is_saved = updated.is_saved;
    await setCurrentBrief(currentBriefData);
    updateSaveButton(updated.is_saved);

    showToast(updated.is_saved ? 'Brief saved!' : 'Brief unsaved');
  } catch (error) {
    console.error('[SidePanel] Save error:', error);
    showToast('Failed to save');
  }
}

// ============================================
// Copy Functions
// ============================================

function copySection(section) {
  let content = '';

  switch (section) {
    case 'summary':
      content = currentBriefData?.summary || '';
      break;
    case 'talkingPoints':
      content = (currentBriefData?.talking_points || []).map(p => `• ${p}`).join('\n');
      break;
    case 'commonGround':
      content = (currentBriefData?.common_ground || []).map(c => `• ${c}`).join('\n');
      break;
    case 'icebreaker':
      content = currentBriefData?.icebreaker || '';
      break;
    case 'questions':
      content = (currentBriefData?.questions || []).map(q => `• ${q}`).join('\n');
      break;
  }

  if (content) {
    navigator.clipboard.writeText(content);
    showToast('Copied to clipboard!');
  }
}

function copyAll() {
  if (!currentBriefData) return;

  const formatted = `
PREREQ BRIEF: ${currentBriefData.profile_name}
${currentBriefData.profile_headline || ''}
${currentBriefData.profile_location || ''} ${currentBriefData.profile_company ? `| ${currentBriefData.profile_company}` : ''}

SUMMARY
${currentBriefData.summary || 'N/A'}

TALKING POINTS
${(currentBriefData.talking_points || []).map(p => `- ${p}`).join('\n') || 'N/A'}

COMMON GROUND
${(currentBriefData.common_ground || []).map(c => `- ${c}`).join('\n') || 'N/A'}

ICEBREAKER
${currentBriefData.icebreaker || 'N/A'}

QUESTIONS TO ASK
${(currentBriefData.questions || []).map(q => `- ${q}`).join('\n') || 'N/A'}

---
Generated by Prereq (prereq.brianmwai.com)
  `.trim();

  navigator.clipboard.writeText(formatted);
  showToast('Full brief copied!');
}

// ============================================
// Utilities
// ============================================

function getDefaultAvatar(name) {
  const initials = (name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Return a data URL for a simple avatar
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" fill="#6366f1"/>
      <text x="40" y="50" font-family="Arial" font-size="28" fill="white" text-anchor="middle">${initials}</text>
    </svg>
  `;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
