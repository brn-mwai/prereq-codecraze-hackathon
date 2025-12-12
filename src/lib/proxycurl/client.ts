// ============================================
// PREREQ - Proxycurl API Client
// ============================================

import { API_CONFIG, LINKEDIN_URL_PATTERNS, ERROR_CODES } from '@/config/constants';
import type { LinkedInProfileData } from '@/types';

const PROXYCURL_BASE_URL = 'https://nubela.co/proxycurl/api/v2';

interface ProxycurlResponse {
  public_identifier: string;
  first_name: string;
  last_name: string;
  full_name: string;
  headline: string | null;
  summary: string | null;
  profile_pic_url: string | null;
  background_cover_image_url: string | null;
  country: string | null;
  country_full_name: string | null;
  city: string | null;
  state: string | null;
  occupation: string | null;
  connections: number | null;
  follower_count: number | null;
  experiences: Array<{
    company: string;
    company_linkedin_profile_url: string | null;
    title: string;
    description: string | null;
    location: string | null;
    starts_at: { day: number | null; month: number | null; year: number } | null;
    ends_at: { day: number | null; month: number | null; year: number } | null;
    logo_url: string | null;
  }>;
  education: Array<{
    school: string;
    school_linkedin_profile_url: string | null;
    degree_name: string | null;
    field_of_study: string | null;
    description: string | null;
    starts_at: { day: number | null; month: number | null; year: number } | null;
    ends_at: { day: number | null; month: number | null; year: number } | null;
    logo_url: string | null;
  }>;
  skills: string[];
  recommendations: string[];
  activities: Array<{
    title: string;
    link: string;
    activity_status: string;
  }>;
  languages: string[];
  certifications: Array<{
    name: string;
    authority: string | null;
    starts_at: { day: number | null; month: number | null; year: number } | null;
    ends_at: { day: number | null; month: number | null; year: number } | null;
    url: string | null;
  }>;
  volunteer_work: Array<{
    company: string;
    title: string;
    description: string | null;
    starts_at: { day: number | null; month: number | null; year: number } | null;
    ends_at: { day: number | null; month: number | null; year: number } | null;
  }>;
}

export class ProxycurlError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'ProxycurlError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Validates a LinkedIn profile URL
 */
export function isValidLinkedInUrl(url: string): boolean {
  return LINKEDIN_URL_PATTERNS.PROFILE.test(url);
}

/**
 * Extracts the LinkedIn username from a URL
 */
export function extractLinkedInUsername(url: string): string | null {
  const match = url.match(LINKEDIN_URL_PATTERNS.PROFILE_EXTRACT);
  return match ? match[1] : null;
}

/**
 * Normalizes a LinkedIn URL to a consistent format
 */
export function normalizeLinkedInUrl(url: string): string {
  const username = extractLinkedInUsername(url);
  if (!username) {
    throw new ProxycurlError(
      'Invalid LinkedIn URL format',
      ERROR_CODES.INVALID_LINKEDIN_URL
    );
  }
  return `https://www.linkedin.com/in/${username}`;
}

/**
 * Fetches a LinkedIn profile using Proxycurl API
 */
export async function fetchLinkedInProfile(
  linkedinUrl: string
): Promise<LinkedInProfileData> {
  const apiKey = process.env.PROXYCURL_API_KEY;

  if (!apiKey) {
    throw new ProxycurlError(
      'Proxycurl API key not configured',
      ERROR_CODES.INTERNAL_ERROR
    );
  }

  // Validate and normalize the URL
  if (!isValidLinkedInUrl(linkedinUrl)) {
    throw new ProxycurlError(
      'Invalid LinkedIn profile URL',
      ERROR_CODES.INVALID_LINKEDIN_URL
    );
  }

  const normalizedUrl = normalizeLinkedInUrl(linkedinUrl);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      API_CONFIG.PROXYCURL_TIMEOUT_MS
    );

    const response = await fetch(
      `${PROXYCURL_BASE_URL}/linkedin?url=${encodeURIComponent(normalizedUrl)}&skills=include&use_cache=if-present`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 404) {
        throw new ProxycurlError(
          'LinkedIn profile not found',
          ERROR_CODES.NOT_FOUND,
          404
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new ProxycurlError(
          'Proxycurl authentication failed',
          ERROR_CODES.PROXYCURL_ERROR,
          response.status
        );
      }

      if (response.status === 429) {
        throw new ProxycurlError(
          'Proxycurl rate limit exceeded',
          ERROR_CODES.RATE_LIMIT_EXCEEDED,
          429
        );
      }

      throw new ProxycurlError(
        `Proxycurl API error: ${errorText}`,
        ERROR_CODES.PROXYCURL_ERROR,
        response.status
      );
    }

    const data: ProxycurlResponse = await response.json();

    // Transform to our internal format
    const profileData: LinkedInProfileData = {
      public_identifier: data.public_identifier,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: data.full_name || `${data.first_name} ${data.last_name}`,
      headline: data.headline,
      summary: data.summary,
      profile_pic_url: data.profile_pic_url,
      background_cover_image_url: data.background_cover_image_url,
      country: data.country,
      country_full_name: data.country_full_name,
      city: data.city,
      state: data.state,
      occupation: data.occupation,
      connections: data.connections,
      follower_count: data.follower_count,
      experiences: data.experiences || [],
      education: data.education || [],
      skills: data.skills || [],
      recommendations: data.recommendations || [],
      activities: data.activities || [],
      languages: data.languages || [],
      certifications: data.certifications || [],
      volunteer_work: data.volunteer_work || [],
    };

    return profileData;
  } catch (error) {
    if (error instanceof ProxycurlError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ProxycurlError(
        'Proxycurl request timed out',
        ERROR_CODES.PROXYCURL_ERROR
      );
    }

    throw new ProxycurlError(
      `Failed to fetch LinkedIn profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ERROR_CODES.PROXYCURL_ERROR
    );
  }
}

/**
 * Gets basic profile info for preview (faster, cheaper)
 */
export async function getProfilePreview(linkedinUrl: string) {
  const profile = await fetchLinkedInProfile(linkedinUrl);

  return {
    name: profile.full_name,
    headline: profile.headline,
    photo_url: profile.profile_pic_url,
    location: [profile.city, profile.state, profile.country_full_name]
      .filter(Boolean)
      .join(', '),
    company: profile.experiences?.[0]?.company || null,
  };
}
