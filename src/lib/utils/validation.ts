// ============================================
// PREREQ - Validation Utilities
// ============================================

import { LINKEDIN_URL_PATTERNS } from '@/config/constants';
import type { MeetingGoal, PresetMeetingGoal } from '@/types';

/**
 * Validates a LinkedIn profile URL
 */
export function isValidLinkedInUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return LINKEDIN_URL_PATTERNS.PROFILE.test(url.trim());
}

/**
 * Preset meeting goals
 */
export const PRESET_MEETING_GOALS: PresetMeetingGoal[] = [
  'networking',
  'sales',
  'hiring',
  'investor',
  'partner',
  'general',
];

/**
 * Checks if a goal is a preset goal
 */
export function isPresetMeetingGoal(goal: string): goal is PresetMeetingGoal {
  return PRESET_MEETING_GOALS.includes(goal as PresetMeetingGoal);
}

/**
 * Validates a meeting goal (preset or custom)
 * Custom goals must be 1-100 characters
 */
export function isValidMeetingGoal(goal: string): goal is MeetingGoal {
  if (!goal || typeof goal !== 'string') return false;
  const trimmed = goal.trim();
  // Must be 1-100 characters
  return trimmed.length >= 1 && trimmed.length <= 100;
}

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a UUID
 */
export function isValidUuid(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Sanitizes a string for safe storage
 */
export function sanitizeString(str: string, maxLength: number = 1000): string {
  if (!str || typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

/**
 * Validates pagination parameters
 */
export function validatePagination(
  page: number,
  limit: number,
  maxLimit: number = 50
): { page: number; limit: number } {
  return {
    page: Math.max(1, Math.floor(page) || 1),
    limit: Math.min(maxLimit, Math.max(1, Math.floor(limit) || 10)),
  };
}

/**
 * Brief generation request validation
 */
export interface BriefGenerationValidation {
  isValid: boolean;
  errors: string[];
  data?: {
    linkedin_url: string;
    meeting_goal: MeetingGoal;
  };
}

export function validateBriefGenerationRequest(body: unknown): BriefGenerationValidation {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: ['Request body is required'] };
  }

  const { linkedin_url, meeting_goal } = body as Record<string, unknown>;

  // Validate LinkedIn URL
  if (!linkedin_url || typeof linkedin_url !== 'string') {
    errors.push('LinkedIn URL is required');
  } else if (!isValidLinkedInUrl(linkedin_url)) {
    errors.push('Invalid LinkedIn URL format');
  }

  // Validate meeting goal (optional, defaults to 'general')
  const goal = meeting_goal || 'general';
  if (typeof goal !== 'string' || !isValidMeetingGoal(goal)) {
    errors.push('Invalid meeting goal');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      linkedin_url: (linkedin_url as string).trim(),
      meeting_goal: goal as MeetingGoal,
    },
  };
}
