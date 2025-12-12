// ============================================
// PREREQ EXTENSION - Auth Listener Content Script
// Listens for auth tokens from the web app
// ============================================

// Listen for auth token from the web app
window.addEventListener('message', async (event) => {
  // Only accept messages from our app
  if (event.origin !== 'https://prereq.brianmwai.com' &&
      event.origin !== 'http://localhost:3000') {
    return;
  }

  if (event.data?.type === 'PREREQ_AUTH_TOKEN' && event.data?.token) {
    console.log('[Prereq] Received auth token from web app');

    // Send token to background script
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'saveAuthToken',
        token: event.data.token,
      });

      if (response?.success) {
        console.log('[Prereq] Auth token saved successfully');
        // Notify the page that auth was successful
        window.postMessage({ type: 'PREREQ_AUTH_SUCCESS' }, event.origin);
      }
    } catch (error) {
      console.error('[Prereq] Failed to save auth token:', error);
    }
  }
});

// Also check localStorage for token (fallback method)
const checkLocalStorage = () => {
  const token = localStorage.getItem('prereq_extension_token');
  if (token) {
    console.log('[Prereq] Found token in localStorage');
    chrome.runtime.sendMessage({
      action: 'saveAuthToken',
      token: token,
    }).then(() => {
      // Clear the token from localStorage after saving
      localStorage.removeItem('prereq_extension_token');
      console.log('[Prereq] Token saved and cleared from localStorage');
    }).catch(console.error);
  }
};

// Check localStorage on page load
checkLocalStorage();

console.log('[Prereq] Auth listener content script loaded');
