// ============================================
// PREREQ EXTENSION - LinkedIn Profile Detector
// ============================================

const PROFILE_URL_PATTERN = /linkedin\.com\/in\/([^\/\?#]+)/;

/**
 * Check if current page is a LinkedIn profile
 */
function isProfilePage() {
  return PROFILE_URL_PATTERN.test(window.location.href);
}

/**
 * Extract profile slug from URL
 */
function extractProfileSlug() {
  const match = window.location.href.match(PROFILE_URL_PATTERN);
  return match ? match[1] : null;
}

/**
 * Get clean profile URL
 */
function getProfileUrl() {
  const slug = extractProfileSlug();
  return slug ? `https://www.linkedin.com/in/${slug}/` : null;
}

// Expose to other scripts
window.prereqLinkedIn = {
  isProfilePage,
  extractProfileSlug,
  getProfileUrl,
};

// Watch for SPA navigation (LinkedIn is a SPA)
let lastUrl = window.location.href;

const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;

    // Notify button injector of URL change
    window.dispatchEvent(new CustomEvent('prereq:urlchange', {
      detail: {
        url: window.location.href,
        isProfile: isProfilePage(),
        profileUrl: getProfileUrl(),
      },
    }));
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initial check
if (isProfilePage()) {
  console.log('[Prereq] LinkedIn profile detected:', getProfileUrl());
}
