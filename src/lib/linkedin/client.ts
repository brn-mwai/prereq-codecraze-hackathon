// ============================================
// PREREQ - LinkedIn API Client (RapidAPI)
// ============================================
// Using Fresh LinkedIn Scraper API
// https://rapidapi.com/saleleadsdotai-saleleadsdotai-default/api/fresh-linkedin-scraper-api

import { API_CONFIG, LINKEDIN_URL_PATTERNS, ERROR_CODES } from '@/config/constants';
import type { LinkedInProfileData } from '@/types';

const RAPIDAPI_HOST = 'fresh-linkedin-scraper-api.p.rapidapi.com';
const RAPIDAPI_BASE_URL = `https://${RAPIDAPI_HOST}`;

// Response structure from Fresh LinkedIn Scraper API
interface FreshLinkedInScraperResponse {
  success?: boolean;
  message?: string;
  data?: {
    username?: string;
    urn?: string; // LinkedIn URN identifier
    id?: string;
    entityUrn?: string;
    publicIdentifier?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    headline?: string;
    summary?: string;
    about?: string;
    profilePicture?: string;
    avatar?: string;
    photo?: string;
    image?: string;
    profilePhoto?: string;
    profile_pic_url?: string;
    displayPictureUrl?: string;
    backgroundImage?: string;
    coverImage?: string;
    country?: string;
    countryCode?: string;
    city?: string;
    location?: string;
    geo?: {
      country?: string;
      city?: string;
      full?: string;
    };
    experience?: Array<{
      title?: string;
      company?: string;
      companyName?: string;
      companyUrl?: string;
      companyLogo?: string;
      location?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      duration?: string;
    }>;
    education?: Array<{
      school?: string;
      schoolName?: string;
      schoolUrl?: string;
      schoolLogo?: string;
      degree?: string;
      degreeName?: string;
      field?: string;
      fieldOfStudy?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    }>;
    skills?: string[] | Array<{ name?: string }>;
    languages?: string[] | Array<{ name?: string; proficiency?: string }>;
    certifications?: Array<{
      name?: string;
      authority?: string;
      url?: string;
      startDate?: string;
      endDate?: string;
    }>;
    volunteer?: Array<{
      title?: string;
      company?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    }>;
    openToWork?: boolean;
    isOpenToWork?: boolean;
    premium?: boolean;
    isPremium?: boolean;
    influencer?: boolean;
    isInfluencer?: boolean;
    connections?: number;
    connectionCount?: number;
    followers?: number;
    followerCount?: number;
  } | null;
}

// Response structure for user images endpoint
interface UserImagesResponse {
  success?: boolean;
  message?: string;
  data?: {
    images?: Array<{
      url?: string;
      width?: number;
      height?: number;
    }>;
    profilePicture?: string;
    displayImage?: string;
  } | null;
}

// Response structure for user posts endpoint
interface UserPostsResponse {
  success?: boolean;
  message?: string;
  data?: Array<{
    text?: string;
    postUrl?: string;
    postedAt?: string;
    likeCount?: number;
    commentCount?: number;
    repostCount?: number;
    images?: string[];
  }> | null;
}

export class LinkedInAPIError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'LinkedInAPIError';
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
    throw new LinkedInAPIError(
      'Invalid LinkedIn URL format',
      ERROR_CODES.INVALID_LINKEDIN_URL
    );
  }
  return `https://www.linkedin.com/in/${username}`;
}

/**
 * Parse date string to date parts
 */
function parseDateString(dateStr: string | undefined): { day: number | null; month: number | null; year: number } | null {
  if (!dateStr) return null;

  // Try parsing formats like "2020-01", "Jan 2020", "2020", "January 2020"
  // Handle "Present" for current positions
  if (dateStr.toLowerCase() === 'present') return null;

  // Try to extract year from various formats
  const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : 0;

  // Try to extract month
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const lowerDate = dateStr.toLowerCase();
  let month: number | null = null;

  for (let i = 0; i < monthNames.length; i++) {
    if (lowerDate.includes(monthNames[i])) {
      month = i + 1;
      break;
    }
  }

  // Also try numeric month (e.g., "2020-01")
  if (!month) {
    const numericMatch = dateStr.match(/(\d{4})[/-](\d{1,2})/);
    if (numericMatch) {
      month = parseInt(numericMatch[2], 10);
    }
  }

  return year > 0 ? { day: null, month, year } : null;
}

/**
 * Fetches user profile image using URN
 */
async function fetchUserImage(urn: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${RAPIDAPI_BASE_URL}/api/v1/user/images?urn=${encodeURIComponent(urn)}&page=1`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.log('[LinkedIn API] Images endpoint returned:', response.status);
      return null;
    }

    const result: UserImagesResponse = await response.json();
    console.log('[LinkedIn API] Images response:', JSON.stringify(result).substring(0, 300));

    if (result.data) {
      // Try to get the largest image or first available
      if (result.data.images && result.data.images.length > 0) {
        // Sort by size (largest first) and return
        const sortedImages = result.data.images
          .filter(img => img.url)
          .sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)));
        if (sortedImages.length > 0) {
          return sortedImages[0].url || null;
        }
      }
      return result.data.profilePicture || result.data.displayImage || null;
    }
    return null;
  } catch (error) {
    console.error('[LinkedIn API] Error fetching images:', error);
    return null;
  }
}

/**
 * Fetches user posts using URN
 */
async function fetchUserPosts(urn: string, apiKey: string): Promise<Array<{
  title: string;
  activity_status: string;
  link: string | null;
}>> {
  try {
    const response = await fetch(
      `${RAPIDAPI_BASE_URL}/api/v1/user/posts?urn=${encodeURIComponent(urn)}&page=1`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.log('[LinkedIn API] Posts endpoint returned:', response.status);
      return [];
    }

    const result: UserPostsResponse = await response.json();
    console.log('[LinkedIn API] Posts response:', JSON.stringify(result).substring(0, 300));

    if (result.data && Array.isArray(result.data)) {
      return result.data.slice(0, 5).map(post => ({
        title: post.text?.substring(0, 200) || 'Posted an update',
        activity_status: post.postedAt || 'Recently',
        link: post.postUrl || null,
      }));
    }
    return [];
  } catch (error) {
    console.error('[LinkedIn API] Error fetching posts:', error);
    return [];
  }
}

// Response structure for user comments endpoint
interface UserCommentsResponse {
  success?: boolean;
  message?: string;
  data?: Array<{
    text?: string;
    postUrl?: string;
    commentedAt?: string;
  }> | null;
}

// Response structure for user reactions endpoint
interface UserReactionsResponse {
  success?: boolean;
  message?: string;
  data?: Array<{
    reactionType?: string;
    postUrl?: string;
    postText?: string;
    reactedAt?: string;
  }> | null;
}

// Response structure for user recommendations endpoint
interface UserRecommendationsResponse {
  success?: boolean;
  message?: string;
  data?: Array<{
    text?: string;
    recommenderName?: string;
    recommenderTitle?: string;
    recommenderUrl?: string;
    relationship?: string;
  }> | null;
}

// Response structure for contact info endpoint
interface ContactInfoResponse {
  success?: boolean;
  message?: string;
  data?: {
    email?: string;
    emails?: string[];
    phone?: string;
    phones?: string[];
    twitter?: string;
    websites?: string[];
    address?: string;
    birthday?: string;
  } | null;
}

/**
 * Fetches user comments using URN
 */
async function fetchUserComments(urn: string, apiKey: string): Promise<Array<{
  text: string;
  postUrl: string | null;
  commentedAt: string;
}>> {
  try {
    const response = await fetch(
      `${RAPIDAPI_BASE_URL}/api/v1/user/comments?urn=${encodeURIComponent(urn)}&page=1`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.log('[LinkedIn API] Comments endpoint returned:', response.status);
      return [];
    }

    const result: UserCommentsResponse = await response.json();
    console.log('[LinkedIn API] Comments response:', JSON.stringify(result).substring(0, 300));

    if (result.data && Array.isArray(result.data)) {
      return result.data.slice(0, 5).map(comment => ({
        text: comment.text?.substring(0, 200) || '',
        postUrl: comment.postUrl || null,
        commentedAt: comment.commentedAt || 'Recently',
      }));
    }
    return [];
  } catch (error) {
    console.error('[LinkedIn API] Error fetching comments:', error);
    return [];
  }
}

/**
 * Fetches user reactions using URN
 */
async function fetchUserReactions(urn: string, apiKey: string): Promise<Array<{
  reactionType: string;
  postText: string | null;
  postUrl: string | null;
}>> {
  try {
    const response = await fetch(
      `${RAPIDAPI_BASE_URL}/api/v1/user/reactions?urn=${encodeURIComponent(urn)}&page=1`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.log('[LinkedIn API] Reactions endpoint returned:', response.status);
      return [];
    }

    const result: UserReactionsResponse = await response.json();
    console.log('[LinkedIn API] Reactions response:', JSON.stringify(result).substring(0, 300));

    if (result.data && Array.isArray(result.data)) {
      return result.data.slice(0, 5).map(reaction => ({
        reactionType: reaction.reactionType || 'like',
        postText: reaction.postText?.substring(0, 150) || null,
        postUrl: reaction.postUrl || null,
      }));
    }
    return [];
  } catch (error) {
    console.error('[LinkedIn API] Error fetching reactions:', error);
    return [];
  }
}

/**
 * Fetches user recommendations using URN
 */
async function fetchUserRecommendations(urn: string, apiKey: string): Promise<Array<{
  text: string;
  recommenderName: string;
  recommenderTitle: string | null;
  relationship: string | null;
}>> {
  try {
    const response = await fetch(
      `${RAPIDAPI_BASE_URL}/api/v1/user/recommendations?urn=${encodeURIComponent(urn)}&page=1`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.log('[LinkedIn API] Recommendations endpoint returned:', response.status);
      return [];
    }

    const result: UserRecommendationsResponse = await response.json();
    console.log('[LinkedIn API] Recommendations response:', JSON.stringify(result).substring(0, 300));

    if (result.data && Array.isArray(result.data)) {
      return result.data.slice(0, 5).map(rec => ({
        text: rec.text || '',
        recommenderName: rec.recommenderName || 'Anonymous',
        recommenderTitle: rec.recommenderTitle || null,
        relationship: rec.relationship || null,
      }));
    }
    return [];
  } catch (error) {
    console.error('[LinkedIn API] Error fetching recommendations:', error);
    return [];
  }
}

/**
 * Fetches user contact info using URN
 */
async function fetchContactInfo(urn: string, apiKey: string): Promise<{
  email: string | null;
  emails: string[];
  phone: string | null;
  phones: string[];
  twitter: string | null;
  websites: string[];
  address: string | null;
  birthday: string | null;
}> {
  try {
    const response = await fetch(
      `${RAPIDAPI_BASE_URL}/api/v1/user/contact-info?urn=${encodeURIComponent(urn)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.log('[LinkedIn API] Contact info endpoint returned:', response.status);
      return { email: null, emails: [], phone: null, phones: [], twitter: null, websites: [], address: null, birthday: null };
    }

    const result: ContactInfoResponse = await response.json();
    console.log('[LinkedIn API] Contact info response:', JSON.stringify(result).substring(0, 300));

    if (result.data) {
      return {
        email: result.data.email || (result.data.emails?.[0]) || null,
        emails: result.data.emails || (result.data.email ? [result.data.email] : []),
        phone: result.data.phone || (result.data.phones?.[0]) || null,
        phones: result.data.phones || (result.data.phone ? [result.data.phone] : []),
        twitter: result.data.twitter || null,
        websites: result.data.websites || [],
        address: result.data.address || null,
        birthday: result.data.birthday || null,
      };
    }
    return { email: null, emails: [], phone: null, phones: [], twitter: null, websites: [], address: null, birthday: null };
  } catch (error) {
    console.error('[LinkedIn API] Error fetching contact info:', error);
    return { email: null, emails: [], phone: null, phones: [], twitter: null, websites: [], address: null, birthday: null };
  }
}

/**
 * Fetches a LinkedIn profile using Fresh LinkedIn Scraper API
 */
export async function fetchLinkedInProfile(
  linkedinUrl: string
): Promise<LinkedInProfileData> {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    throw new LinkedInAPIError(
      'RapidAPI key not configured',
      ERROR_CODES.INTERNAL_ERROR
    );
  }

  // Validate and normalize the URL
  if (!isValidLinkedInUrl(linkedinUrl)) {
    throw new LinkedInAPIError(
      'Invalid LinkedIn profile URL',
      ERROR_CODES.INVALID_LINKEDIN_URL
    );
  }

  const username = extractLinkedInUsername(linkedinUrl);
  if (!username) {
    throw new LinkedInAPIError(
      'Could not extract username from LinkedIn URL',
      ERROR_CODES.INVALID_LINKEDIN_URL
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      API_CONFIG.LINKEDIN_TIMEOUT_MS || 30000
    );

    // Use the /api/v1/user/profile endpoint with username
    const response = await fetch(
      `${RAPIDAPI_BASE_URL}/api/v1/user/profile?username=${encodeURIComponent(username)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': apiKey,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LinkedIn API] Error response:', response.status, errorText);

      if (response.status === 404) {
        throw new LinkedInAPIError(
          'LinkedIn profile not found',
          ERROR_CODES.NOT_FOUND,
          404
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new LinkedInAPIError(
          'RapidAPI authentication failed. Please check your API key.',
          ERROR_CODES.LINKEDIN_API_ERROR,
          response.status
        );
      }

      if (response.status === 429) {
        throw new LinkedInAPIError(
          'RapidAPI rate limit exceeded. Please try again later.',
          ERROR_CODES.RATE_LIMIT_EXCEEDED,
          429
        );
      }

      throw new LinkedInAPIError(
        `LinkedIn API error: ${errorText}`,
        ERROR_CODES.LINKEDIN_API_ERROR,
        response.status
      );
    }

    const result: FreshLinkedInScraperResponse = await response.json();
    console.log('[LinkedIn API] Response received:', JSON.stringify(result).substring(0, 500));

    // Check for API error responses
    if (result.success === false) {
      throw new LinkedInAPIError(
        result.message || 'Failed to fetch LinkedIn profile',
        ERROR_CODES.LINKEDIN_API_ERROR
      );
    }

    // Get data from response
    const data = result.data;

    if (!data) {
      throw new LinkedInAPIError(
        'No profile data returned from LinkedIn API',
        ERROR_CODES.LINKEDIN_API_ERROR
      );
    }

    // Extract URN for additional API calls
    const urn = data.urn || data.entityUrn || data.id || null;
    console.log('[LinkedIn API] Extracted URN:', urn);

    // Fetch all additional data in parallel if URN is available
    let profileImageUrl: string | null = null;
    let userPosts: Array<{ title: string; activity_status: string; link: string | null }> = [];
    let userComments: Array<{ text: string; postUrl: string | null; commentedAt: string }> = [];
    let userReactions: Array<{ reactionType: string; postText: string | null; postUrl: string | null }> = [];
    let userRecommendations: Array<{ text: string; recommenderName: string; recommenderTitle: string | null; relationship: string | null }> = [];
    let contactInfo: { email: string | null; emails: string[]; phone: string | null; phones: string[]; twitter: string | null; websites: string[]; address: string | null; birthday: string | null } = {
      email: null, emails: [], phone: null, phones: [], twitter: null, websites: [], address: null, birthday: null
    };

    if (urn) {
      console.log('[LinkedIn API] Fetching all additional data for URN:', urn);
      const [imageResult, postsResult, commentsResult, reactionsResult, recommendationsResult, contactResult] = await Promise.all([
        fetchUserImage(urn, apiKey),
        fetchUserPosts(urn, apiKey),
        fetchUserComments(urn, apiKey),
        fetchUserReactions(urn, apiKey),
        fetchUserRecommendations(urn, apiKey),
        fetchContactInfo(urn, apiKey),
      ]);
      profileImageUrl = imageResult;
      userPosts = postsResult;
      userComments = commentsResult;
      userReactions = reactionsResult;
      userRecommendations = recommendationsResult;
      contactInfo = contactResult;
      console.log('[LinkedIn API] Fetched image URL:', profileImageUrl);
      console.log('[LinkedIn API] Fetched posts count:', userPosts.length);
      console.log('[LinkedIn API] Fetched comments count:', userComments.length);
      console.log('[LinkedIn API] Fetched reactions count:', userReactions.length);
      console.log('[LinkedIn API] Fetched recommendations count:', userRecommendations.length);
      console.log('[LinkedIn API] Fetched contact info:', contactInfo.email ? 'Has email' : 'No email');
    }

    // Extract skills
    const skills: string[] = Array.isArray(data.skills)
      ? data.skills.map((s) => (typeof s === 'string' ? s : s.name || '')).filter(Boolean)
      : [];

    // Extract languages
    const languages: string[] = Array.isArray(data.languages)
      ? data.languages.map((l) => (typeof l === 'string' ? l : l.name || '')).filter(Boolean)
      : [];

    // Get experiences
    const experiences = data.experience || [];

    // Determine the best profile picture URL (prefer fetched image over profile response)
    const bestProfilePicUrl = profileImageUrl ||
      data.profilePicture || data.avatar || data.photo ||
      data.image || data.profilePhoto || data.profile_pic_url ||
      data.displayPictureUrl || null;

    // Transform to our internal format
    const profileData: LinkedInProfileData = {
      public_identifier: data.username || username,
      first_name: data.firstName || '',
      last_name: data.lastName || '',
      full_name: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      headline: data.headline || null,
      summary: data.summary || data.about || null,
      profile_pic_url: bestProfilePicUrl,
      background_cover_image_url: data.backgroundImage || data.coverImage || null,
      country: data.countryCode || data.geo?.country || null,
      country_full_name: data.country || data.geo?.country || null,
      city: data.city || data.geo?.city || null,
      state: null,
      occupation: data.headline || null,
      connections: data.connections || data.connectionCount || null,
      follower_count: data.followers || data.followerCount || null,
      experiences: experiences.map((exp) => ({
        company: exp.company || exp.companyName || '',
        company_linkedin_profile_url: exp.companyUrl || null,
        title: exp.title || '',
        description: exp.description || null,
        location: exp.location || null,
        starts_at: parseDateString(exp.startDate),
        ends_at: parseDateString(exp.endDate),
        logo_url: exp.companyLogo || null,
      })),
      education: (data.education || []).map((edu) => ({
        school: edu.school || edu.schoolName || '',
        school_linkedin_profile_url: edu.schoolUrl || null,
        degree_name: edu.degree || edu.degreeName || null,
        field_of_study: edu.field || edu.fieldOfStudy || null,
        description: edu.description || null,
        starts_at: parseDateString(edu.startDate),
        ends_at: parseDateString(edu.endDate),
        logo_url: edu.schoolLogo || null,
      })),
      skills,
      recommendations: userRecommendations.map(rec => rec.text),
      activities: userPosts,
      languages,
      certifications: (data.certifications || []).map((cert) => ({
        name: cert.name || '',
        authority: cert.authority || null,
        starts_at: parseDateString(cert.startDate),
        ends_at: parseDateString(cert.endDate),
        url: cert.url || null,
      })),
      volunteer_work: (data.volunteer || []).map((vol) => ({
        company: vol.company || '',
        title: vol.title || '',
        description: vol.description || null,
        starts_at: parseDateString(vol.startDate),
        ends_at: parseDateString(vol.endDate),
      })),
      // Additional fields
      open_to_work: data.openToWork || data.isOpenToWork || false,
      is_premium: data.premium || data.isPremium || false,
      is_influencer: data.influencer || data.isInfluencer || false,
      // Contact info
      email: contactInfo.email,
      emails: contactInfo.emails,
      phone: contactInfo.phone,
      phones: contactInfo.phones,
      twitter: contactInfo.twitter,
      websites: contactInfo.websites,
      address: contactInfo.address,
      birthday: contactInfo.birthday,
      // Engagement data
      comments: userComments,
      reactions: userReactions,
      recommendations_received: userRecommendations,
    };

    return profileData;
  } catch (error) {
    if (error instanceof LinkedInAPIError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new LinkedInAPIError(
        'LinkedIn API request timed out',
        ERROR_CODES.LINKEDIN_API_ERROR
      );
    }

    throw new LinkedInAPIError(
      `Failed to fetch LinkedIn profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ERROR_CODES.LINKEDIN_API_ERROR
    );
  }
}

/**
 * Gets basic profile info for preview
 */
export async function getProfilePreview(linkedinUrl: string) {
  const profile = await fetchLinkedInProfile(linkedinUrl);

  return {
    name: profile.full_name,
    headline: profile.headline,
    photo_url: profile.profile_pic_url,
    location: [profile.city, profile.country_full_name]
      .filter(Boolean)
      .join(', '),
    company: profile.experiences?.[0]?.company || null,
    open_to_work: profile.open_to_work || false,
  };
}

// Re-export for backward compatibility
export { LinkedInAPIError as ProxycurlError };
