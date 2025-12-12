// ============================================
// PREREQ - Type Definitions
// ============================================

// -------------------- User Types --------------------

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: string | null;
  linkedin_url: string | null;
  linkedin_data: LinkedInProfileData | null;
  plan: PlanType;
  created_at: string;
  updated_at: string;
}

export type PlanType = 'free' | 'starter' | 'pro';

export interface PlanLimits {
  free: number;
  starter: number;
  pro: number;
}

export const PLAN_LIMITS: PlanLimits = {
  free: 5,
  starter: 30,
  pro: 100,
};

// -------------------- Brief Types --------------------

// Preset meeting goals
export type PresetMeetingGoal =
  | 'networking'
  | 'sales'
  | 'hiring'
  | 'investor'
  | 'partner'
  | 'general';

// Meeting goal can be a preset or custom string
export type MeetingGoal = PresetMeetingGoal | (string & {});

export interface Brief {
  id: string;
  user_id: string;
  linkedin_url: string;
  meeting_goal: MeetingGoal;

  // Profile data (from Proxycurl)
  profile_name: string;
  profile_headline: string | null;
  profile_photo_url: string | null;
  profile_location: string | null;
  profile_company: string | null;
  profile_data: LinkedInProfileData | null;

  // AI-generated content
  summary: string;
  talking_points: string[];
  common_ground: string[];
  icebreaker: string;
  questions: string[];

  // Metadata
  is_saved: boolean;
  created_at: string;
  updated_at: string;
}

export interface BriefGenerateRequest {
  linkedin_url: string;
  meeting_goal?: MeetingGoal;
}

export interface BriefGenerateResponse {
  brief: Brief;
}

export interface BriefsListResponse {
  briefs: Brief[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface BriefsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  goal?: MeetingGoal;
  saved?: boolean;
  sort?: 'created_at' | 'profile_name';
  order?: 'asc' | 'desc';
}

// -------------------- LinkedIn/Proxycurl Types --------------------

export interface LinkedInProfileData {
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

  // Experience
  experiences: LinkedInExperience[];

  // Education
  education: LinkedInEducation[];

  // Skills
  skills: string[];

  // Recommendations
  recommendations: string[];

  // Activities
  activities: LinkedInActivity[];

  // Additional
  languages: string[];
  certifications: LinkedInCertification[];
  volunteer_work: LinkedInVolunteer[];

  // Extra fields from Real-Time LinkedIn Scraper API
  open_to_work?: boolean;
  is_premium?: boolean;
  is_influencer?: boolean;

  // Contact info
  email?: string | null;
  emails?: string[];
  phone?: string | null;
  phones?: string[];
  twitter?: string | null;
  websites?: string[];
  address?: string | null;
  birthday?: string | null;

  // Engagement data
  comments?: LinkedInComment[];
  reactions?: LinkedInReaction[];
  recommendations_received?: LinkedInRecommendation[];
}

export interface LinkedInExperience {
  company: string;
  company_linkedin_profile_url: string | null;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: DateInfo | null;
  ends_at: DateInfo | null;
  logo_url: string | null;
}

export interface LinkedInEducation {
  school: string;
  school_linkedin_profile_url: string | null;
  degree_name: string | null;
  field_of_study: string | null;
  description: string | null;
  starts_at: DateInfo | null;
  ends_at: DateInfo | null;
  logo_url: string | null;
}

export interface LinkedInActivity {
  title: string;
  link: string | null;
  activity_status: string;
}

export interface LinkedInCertification {
  name: string;
  authority: string | null;
  starts_at: DateInfo | null;
  ends_at: DateInfo | null;
  url: string | null;
}

export interface LinkedInVolunteer {
  company: string;
  title: string;
  description: string | null;
  starts_at: DateInfo | null;
  ends_at: DateInfo | null;
}

export interface DateInfo {
  day: number | null;
  month: number | null;
  year: number;
}

export interface LinkedInComment {
  text: string;
  postUrl: string | null;
  commentedAt: string;
}

export interface LinkedInReaction {
  reactionType: string;
  postText: string | null;
  postUrl: string | null;
}

export interface LinkedInRecommendation {
  text: string;
  recommenderName: string;
  recommenderTitle: string | null;
  relationship: string | null;
}

// -------------------- Chat Types --------------------

export interface ChatSession {
  id: string;
  user_id: string;
  brief_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  brief_id?: string;
  session_id?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  session_id: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  session_id: string;
  brief?: Brief;
}

// -------------------- Usage Types --------------------

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
  reset_date: string;
  plan: PlanType;
}

export interface DashboardStats {
  briefs_generated: number;
  briefs_this_month: number;
  time_saved_minutes: number;
  meetings_prepped: number;
}

// -------------------- Usage Log Types --------------------

export type UsageAction =
  | 'brief_generated'
  | 'brief_refreshed'
  | 'chat_message'
  | 'profile_synced';

export interface UsageLog {
  id: string;
  user_id: string;
  action: UsageAction;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// -------------------- API Response Types --------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// -------------------- Webhook Types --------------------

export interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
    created_at: number;
    updated_at: number;
  };
}
