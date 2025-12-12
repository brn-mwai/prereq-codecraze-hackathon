// ============================================
// PREREQ EXTENSION - Configuration
// ============================================

// API Base URL - change for production
export const API_BASE = typeof chrome !== 'undefined' && chrome.runtime?.id
  ? 'https://prereq.brianmwai.com'
  : 'http://localhost:3000';

// Auth page URL
export const AUTH_URL = `${API_BASE}/auth/extension`;

// Cache duration (24 hours)
export const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Meeting goals
export const MEETING_GOALS = [
  { id: 'networking', label: 'Networking', icon: '🤝' },
  { id: 'sales', label: 'Sales', icon: '💼' },
  { id: 'hiring', label: 'Hiring', icon: '👔' },
  { id: 'investor', label: 'Investor', icon: '💰' },
  { id: 'partner', label: 'Partner', icon: '🤝' },
  { id: 'general', label: 'General', icon: '📋' },
];
