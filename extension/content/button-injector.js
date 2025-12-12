// ============================================
// PREREQ EXTENSION - LinkedIn Button Injector
// ============================================

let buttonInjected = false;
let currentProfileUrl = null;

// SVG Icons
const ICONS = {
  logo: `<svg class="prereq-logo" viewBox="0 0 166 167" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M104.004 105C104.004 105 158.019 98.8837 156.004 54C153.99 9.11629 104.004 9 104.004 9H30.5043C30.5043 9 22.5044 9 14.5044 16.5C10.0518 20.6743 9.00434 29.5 9.00434 29.5V136.5C9.00434 136.5 8.64328 144 14.5043 150C22.3191 158 30.5043 157 30.5043 157H84.5043C84.5043 157 94.5104 154.159 98.5043 150C102.557 145.78 104.004 136.5 104.004 136.5V105ZM104.004 105H71.0043C71.0043 105 66.0043 105.857 61.5043 102C57.0043 98.1428 57.5043 94 57.5043 94V70.5C57.5043 70.5 58.0043 64.75 61.5043 61C65.0043 57.25 71.0043 56.5 71.0043 56.5H92.5043C92.5043 56.5 96.2345 56.5 100.004 60C102.312 62.1422 104.004 67 104.004 67V105Z" fill="currentColor"/>
  </svg>`,
  check: `<svg class="prereq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`,
  alert: `<svg class="prereq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>`,
  document: `<svg class="prereq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>`,
};

/**
 * Find the best container for the Prereq button
 */
function findButtonContainer() {
  // Try different selectors (LinkedIn changes their DOM frequently)
  const selectors = [
    '.pv-top-card-v2-ctas',
    '.pvs-profile-actions',
    '.pv-top-card-profile-picture-container',
    '[data-view-name="profile-card-actions"]',
    '.pv-top-card__cta-container',
  ];

  for (const selector of selectors) {
    const container = document.querySelector(selector);
    if (container) return container;
  }

  // Fallback: find the Connect/Message buttons area
  const connectBtn = document.querySelector('button[aria-label*="Connect"], button[aria-label*="Message"]');
  if (connectBtn && connectBtn.parentElement) {
    return connectBtn.parentElement;
  }

  return null;
}

/**
 * Create the Prereq button element
 */
function createButton() {
  const button = document.createElement('button');
  button.id = 'prereq-button';
  button.className = 'prereq-btn prereq-btn-default';
  button.innerHTML = `
    ${ICONS.logo}
    <span class="prereq-text">Prereq Brief</span>
  `;
  button.addEventListener('click', handleButtonClick);
  return button;
}

/**
 * Inject the button into the page
 */
function injectButton() {
  // Don't inject if already present
  if (document.querySelector('#prereq-button')) {
    return;
  }

  // Check if on profile page
  if (!window.prereqLinkedIn?.isProfilePage()) {
    return;
  }

  const container = findButtonContainer();
  if (!container) {
    // Retry after a short delay (page might still be loading)
    setTimeout(injectButton, 500);
    return;
  }

  const button = createButton();
  container.appendChild(button);
  buttonInjected = true;
  currentProfileUrl = window.prereqLinkedIn.getProfileUrl();

  console.log('[Prereq] Button injected for:', currentProfileUrl);
}

/**
 * Remove the button from the page
 */
function removeButton() {
  const button = document.querySelector('#prereq-button');
  if (button) {
    button.remove();
    buttonInjected = false;
    currentProfileUrl = null;
  }
}

/**
 * Update button state
 */
function setButtonState(state, text) {
  const button = document.querySelector('#prereq-button');
  if (!button) return;

  button.className = `prereq-btn prereq-btn-${state}`;
  button.disabled = state === 'loading';

  const iconMap = {
    default: ICONS.logo,
    loading: '',
    success: ICONS.check,
    error: ICONS.alert,
    cached: ICONS.document,
  };

  const icon = iconMap[state] || ICONS.logo;
  const spinnerHtml = state === 'loading' ? '<span class="prereq-spinner"></span>' : icon;

  button.innerHTML = `
    ${spinnerHtml}
    <span class="prereq-text">${text}</span>
  `;
}

/**
 * Handle button click
 */
async function handleButtonClick(e) {
  e.preventDefault();
  e.stopPropagation();

  const profileUrl = window.prereqLinkedIn?.getProfileUrl();
  if (!profileUrl) {
    console.error('[Prereq] Could not get profile URL');
    return;
  }

  setButtonState('loading', 'Generating...');

  try {
    // Send message to background worker
    const response = await chrome.runtime.sendMessage({
      action: 'generateBrief',
      profileUrl: profileUrl,
    });

    if (response.success) {
      setButtonState('success', 'Brief Ready');

      // Open side panel
      chrome.runtime.sendMessage({ action: 'openSidePanel' });

      // Reset button after delay
      setTimeout(() => {
        setButtonState('cached', 'View Brief');
      }, 2000);
    } else if (response.error === 'Not authenticated') {
      setButtonState('default', 'Sign In');
      // Open sign in
      chrome.runtime.sendMessage({ action: 'openSignIn' });
    } else {
      throw new Error(response.error || 'Failed to generate brief');
    }
  } catch (error) {
    console.error('[Prereq] Error:', error);
    setButtonState('error', 'Try Again');

    // Reset after delay
    setTimeout(() => {
      setButtonState('default', 'Prereq Brief');
    }, 3000);
  }
}

// Listen for URL changes (SPA navigation)
window.addEventListener('prereq:urlchange', (e) => {
  const { isProfile, profileUrl } = e.detail;

  if (isProfile) {
    // New profile page
    if (profileUrl !== currentProfileUrl) {
      removeButton();
      setTimeout(injectButton, 300);
    }
  } else {
    // Not a profile page, remove button
    removeButton();
  }
});

// Initial injection
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(injectButton, 500);
  });
} else {
  setTimeout(injectButton, 500);
}

// Also try injecting after a longer delay (for slow-loading pages)
setTimeout(injectButton, 2000);
