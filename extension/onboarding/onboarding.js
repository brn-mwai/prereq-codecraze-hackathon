// ============================================
// PREREQ EXTENSION - Onboarding
// ============================================

import { openSignIn, isAuthenticated } from '../lib/auth.js';
import { API_BASE } from '../lib/config.js';
import { initSageOrb } from '../lib/sage-orb.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Sage orb
  const sageCanvas = document.getElementById('sageOrb');
  if (sageCanvas) {
    await initSageOrb(sageCanvas, {
      size: 28,
      initialState: 'idle',
    });
  }

  // Check if already authenticated
  const authenticated = await isAuthenticated();
  if (authenticated) {
    // Redirect to dashboard
    window.location.href = `${API_BASE}/dashboard`;
    return;
  }

  // Setup sign in button
  document.getElementById('signInBtn').addEventListener('click', () => {
    openSignIn();
  });
});
