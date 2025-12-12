// ============================================
// PREREQ - Application Constants
// ============================================

// -------------------- Plan Configuration --------------------

export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    price: 0,
    briefs_per_month: 10,
    features: [
      '10 briefs per month',
      'Chrome extension',
      'Basic talking points',
      'Brief history',
    ],
  },
  starter: {
    name: 'Starter',
    price: 7,
    briefs_per_month: 30,
    features: [
      '30 briefs per month',
      'Chrome extension',
      'Advanced talking points',
      'Common ground analysis',
      'AI Assistant chat',
    ],
  },
  pro: {
    name: 'Pro',
    price: 15,
    briefs_per_month: 100,
    features: [
      '100 briefs per month',
      'Everything in Starter',
      'Calendar integration',
      'Auto meeting prep',
      'Priority support',
    ],
  },
} as const;

// Plan limits lookup (for easier access in API routes)
export const PLAN_LIMITS = {
  free: PLAN_CONFIG.free.briefs_per_month,
  starter: PLAN_CONFIG.starter.briefs_per_month,
  pro: PLAN_CONFIG.pro.briefs_per_month,
} as const;

// -------------------- Meeting Goals --------------------

export const MEETING_GOALS = [
  { value: 'networking', label: 'Networking', icon: 'handshake' },
  { value: 'sales', label: 'Sales', icon: 'briefcase' },
  { value: 'hiring', label: 'Hiring', icon: 'user-plus' },
  { value: 'investor', label: 'Investor', icon: 'trending-up' },
  { value: 'partner', label: 'Partnership', icon: 'users' },
  { value: 'general', label: 'General', icon: 'message-circle' },
] as const;

// -------------------- API Configuration --------------------

export const API_CONFIG = {
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 60,

  // Cache TTL (in seconds)
  CACHE_TTL_BRIEF: 60 * 60 * 24, // 24 hours
  CACHE_TTL_PROFILE: 60 * 60 * 24 * 7, // 7 days
  CACHE_TTL_USAGE: 60, // 1 minute

  // Timeouts
  PROXYCURL_TIMEOUT_MS: 30000, // Legacy - kept for compatibility
  LINKEDIN_TIMEOUT_MS: 30000,
  CLAUDE_TIMEOUT_MS: 60000,
} as const;

// -------------------- LinkedIn URL Patterns --------------------

export const LINKEDIN_URL_PATTERNS = {
  PROFILE: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i,
  PROFILE_EXTRACT: /linkedin\.com\/in\/([\w-]+)/i,
} as const;

// -------------------- Brief Generation --------------------

export const BRIEF_SECTIONS = [
  'summary',
  'talking_points',
  'common_ground',
  'icebreaker',
  'questions',
] as const;

export const TIME_SAVED_PER_BRIEF_MINUTES = 15;

// -------------------- Error Codes --------------------

export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_LINKEDIN_URL: 'INVALID_LINKEDIN_URL',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Limit errors
  USAGE_LIMIT_EXCEEDED: 'USAGE_LIMIT_EXCEEDED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // External service errors
  PROXYCURL_ERROR: 'PROXYCURL_ERROR', // Legacy - kept for compatibility
  LINKEDIN_API_ERROR: 'LINKEDIN_API_ERROR',
  CLAUDE_ERROR: 'CLAUDE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// -------------------- Routes --------------------

export const ROUTES = {
  // Public routes
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',

  // Dashboard routes
  DASHBOARD: '/dashboard',
  BRIEFS: '/dashboard/briefs',
  BRIEF_VIEW: (id: string) => `/dashboard/briefs/${id}`,
  SETTINGS: '/dashboard/settings',
  BILLING: '/dashboard/billing',

  // API routes
  API: {
    BRIEFS: '/api/briefs',
    BRIEF_GENERATE: '/api/briefs/generate',
    BRIEF_BY_ID: (id: string) => `/api/briefs/${id}`,
    BRIEF_REFRESH: (id: string) => `/api/briefs/${id}/refresh`,
    CHAT: '/api/chat',
    CHAT_HISTORY: (briefId: string) => `/api/chat/${briefId}`,
    USAGE: '/api/usage',
    STATS: '/api/stats',
    USER_PROFILE: '/api/user/profile',
    USER_LINKEDIN: '/api/user/linkedin',
    USER_LINKEDIN_SYNC: '/api/user/linkedin/sync',
    WEBHOOKS_CLERK: '/api/webhooks/clerk',
  },
} as const;
