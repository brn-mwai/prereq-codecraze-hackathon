// ============================================
// PREREQ - Groq API Client
// Supports multiple models including GPT-OSS, Llama, Qwen
// ============================================

import { ERROR_CODES } from '@/config/constants';
import { getDefaultModel, getModelById } from '@/config/ai-models';
import type { LinkedInProfileData, MeetingGoal } from '@/types';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Default models
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
const FAST_GROQ_MODEL = 'llama-3.1-8b-instant';

export class GroqError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'GroqError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface GroqRequestOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
  useTools?: boolean;
  reasoningEffort?: 'low' | 'medium' | 'high';
}

/**
 * Makes a request to Groq API
 */
async function groqRequest(
  messages: GroqMessage[],
  options: GroqRequestOptions = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new GroqError(
      'Groq API key not configured',
      ERROR_CODES.INTERNAL_ERROR
    );
  }

  const {
    model = DEFAULT_GROQ_MODEL,
    maxTokens = 8192,
    temperature = 1,
    topP = 1,
    stream = false,
    useTools = false,
    reasoningEffort = 'medium',
  } = options;

  // Build request body
  const requestBody: Record<string, unknown> = {
    model,
    messages,
    max_completion_tokens: maxTokens,
    temperature,
    top_p: topP,
    stream,
  };

  // Add reasoning effort for supported models
  if (model.includes('gpt-oss') || model.includes('compound')) {
    requestBody.reasoning_effort = reasoningEffort;
  }

  // Add tools for supported models
  if (useTools && (model.includes('gpt-oss') || model.includes('compound'))) {
    requestBody.tools = [
      { type: 'browser_search' },
      { type: 'code_interpreter' },
    ];
  }

  try {
    const response = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 429) {
        throw new GroqError(
          'Groq rate limit exceeded',
          ERROR_CODES.RATE_LIMIT_EXCEEDED,
          429
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new GroqError(
          'Groq authentication failed',
          ERROR_CODES.INTERNAL_ERROR,
          response.status
        );
      }

      throw new GroqError(
        `Groq API error: ${errorText}`,
        ERROR_CODES.INTERNAL_ERROR,
        response.status
      );
    }

    const data: GroqResponse = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new GroqError(
        'Invalid response from Groq',
        ERROR_CODES.INTERNAL_ERROR
      );
    }

    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof GroqError) {
      throw error;
    }

    throw new GroqError(
      `Groq request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ERROR_CODES.INTERNAL_ERROR
    );
  }
}

/**
 * Makes a request to Groq API with a specific model
 */
export async function groqChat(
  messages: GroqMessage[],
  modelId: string,
  options: Omit<GroqRequestOptions, 'model'> = {}
): Promise<string> {
  return groqRequest(messages, { ...options, model: modelId });
}

// -------------------- Brief Generation (Groq) --------------------

export interface GeneratedBrief {
  summary: string;
  talking_points: string[];
  common_ground: string[];
  icebreaker: string;
  questions: string[];
  // Enhanced fields
  personality_insights?: string;
  communication_style?: string;
  rapport_tips?: string[];
  potential_challenges?: string[];
  meeting_strategy?: string;
  follow_up_hooks?: string[];
  linkedin_dm_template?: string;
  email_template?: string;
}

interface BriefGenerationContext {
  targetProfile: LinkedInProfileData;
  userProfile?: LinkedInProfileData | null;
  meetingGoal: MeetingGoal;
  userName?: string;
  userCompany?: string;
  userRole?: string;
}

/**
 * Generates a meeting prep brief using Groq (fallback)
 */
export async function generateBriefWithGroq(
  context: BriefGenerationContext
): Promise<GeneratedBrief> {
  const { targetProfile, userProfile, meetingGoal, userName, userCompany, userRole } = context;

  const systemPrompt = buildBriefSystemPrompt();
  const userPrompt = buildBriefUserPrompt(
    targetProfile,
    userProfile,
    meetingGoal,
    userName,
    userCompany,
    userRole
  );

  try {
    const response = await groqRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { maxTokens: 4096, temperature: 0.7 }
    );

    return parseGeneratedBrief(response);
  } catch (error) {
    if (error instanceof GroqError) {
      throw error;
    }

    throw new GroqError(
      `Failed to generate brief with Groq: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ERROR_CODES.INTERNAL_ERROR
    );
  }
}

function buildBriefSystemPrompt(): string {
  return `You are an elite meeting strategist and executive coach. Analyze LinkedIn profiles and generate comprehensive, highly actionable meeting briefs.

Respond ONLY with valid JSON:
{
  "summary": "2-3 sentence executive summary: WHO they are, their POWER/INFLUENCE, KEY achievements, what drives them",
  "personality_insights": "Based on career trajectory and choices - what type of person? Analytical, creative, relationship-focused, results-driven?",
  "communication_style": "How to communicate with them: data/facts, stories/vision, relationship-building, or straight to business?",
  "talking_points": ["5-7 highly specific, researched points showing you've done your homework"],
  "common_ground": ["3-5 genuine connection points - be creative with overlaps"],
  "rapport_tips": ["3 specific techniques to build rapport with THIS person"],
  "potential_challenges": ["2-3 potential objections or friction points to prepare for"],
  "meeting_strategy": "2-3 sentence tactical strategy for maximum success",
  "icebreaker": "Brilliant, personalized opener showing genuine research - NOT generic",
  "questions": ["5 thoughtful questions showing deep research they'll WANT to answer"],
  "follow_up_hooks": ["3 specific things to follow up on after the meeting"],
  "linkedin_dm_template": "Warm LinkedIn DM under 300 chars that feels authentic",
  "email_template": "Professional personalized email with clear CTA"
}

CRITICAL: Be SPECIFIC - every point must reference their actual profile. Generic advice is useless.
Think STRATEGICALLY - what angles give the user leverage?
Be INSIGHTFUL - read between the lines of their career choices.
Respond ONLY with JSON, no other text.`;
}

function buildBriefUserPrompt(
  targetProfile: LinkedInProfileData,
  userProfile: LinkedInProfileData | null | undefined,
  meetingGoal: MeetingGoal,
  userName?: string,
  userCompany?: string,
  userRole?: string
): string {
  const meetingContext = getMeetingContext(meetingGoal);

  let prompt = `Generate a meeting prep brief for the following LinkedIn profile.

**Meeting Goal:** ${meetingContext}

**Target Person's Profile:**
- Name: ${targetProfile.full_name}
- Headline: ${targetProfile.headline || 'N/A'}
- Location: ${[targetProfile.city, targetProfile.state, targetProfile.country_full_name].filter(Boolean).join(', ') || 'N/A'}
- Summary: ${targetProfile.summary || 'N/A'}

**Current Experience:**
${formatExperiences(targetProfile.experiences?.slice(0, 3))}

**Education:**
${formatEducation(targetProfile.education?.slice(0, 2))}

**Skills:** ${targetProfile.skills?.slice(0, 10).join(', ') || 'N/A'}
`;

  if (userProfile || userName) {
    prompt += `\n**About Me (the person preparing for the meeting):**`;

    if (userName) prompt += `\n- Name: ${userName}`;
    if (userCompany) prompt += `\n- Company: ${userCompany}`;
    if (userRole) prompt += `\n- Role: ${userRole}`;

    if (userProfile) {
      prompt += `\n- Headline: ${userProfile.headline || 'N/A'}`;
      prompt += `\n- Skills: ${userProfile.skills?.slice(0, 5).join(', ') || 'N/A'}`;

      if (userProfile.experiences?.length) {
        const currentJob = userProfile.experiences[0];
        prompt += `\n- Current Role: ${currentJob.title} at ${currentJob.company}`;
      }
    }
  }

  prompt += `\n\nGenerate the brief JSON now:`;

  return prompt;
}

function getMeetingContext(goal: MeetingGoal): string {
  // Preset goal descriptions
  const presetContexts: Record<string, string> = {
    networking: 'Professional networking - building a genuine connection',
    sales: 'Sales meeting - understanding their needs and presenting solutions',
    hiring: 'Hiring/recruiting - evaluating cultural fit and discussing opportunities',
    investor: 'Investor meeting - discussing potential investment or partnership',
    partner: 'Partnership discussion - exploring business collaboration',
    general: 'General professional meeting',
  };

  // Check if it's a preset goal
  if (presetContexts[goal]) {
    return presetContexts[goal];
  }

  // Custom goal - use the text directly with context
  return `Custom goal: ${goal} - tailor the brief to help achieve this specific objective`;
}

function formatExperiences(experiences?: LinkedInProfileData['experiences']): string {
  if (!experiences?.length) return 'N/A';

  return experiences
    .map((exp) => {
      const duration = exp.ends_at
        ? `${exp.starts_at?.year || '?'} - ${exp.ends_at.year}`
        : `${exp.starts_at?.year || '?'} - Present`;
      return `- ${exp.title} at ${exp.company} (${duration})`;
    })
    .join('\n');
}

function formatEducation(education?: LinkedInProfileData['education']): string {
  if (!education?.length) return 'N/A';

  return education
    .map((edu) => {
      return `- ${edu.school}${edu.degree_name ? `, ${edu.degree_name}` : ''}${edu.field_of_study ? ` in ${edu.field_of_study}` : ''}`;
    })
    .join('\n');
}

function parseGeneratedBrief(text: string): GeneratedBrief {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('Missing or invalid summary');
    }

    return {
      summary: parsed.summary,
      talking_points: Array.isArray(parsed.talking_points)
        ? parsed.talking_points.filter((p: unknown) => typeof p === 'string')
        : [],
      common_ground: Array.isArray(parsed.common_ground)
        ? parsed.common_ground.filter((p: unknown) => typeof p === 'string')
        : [],
      icebreaker:
        typeof parsed.icebreaker === 'string'
          ? parsed.icebreaker
          : 'Great to connect with you!',
      questions: Array.isArray(parsed.questions)
        ? parsed.questions.filter((p: unknown) => typeof p === 'string')
        : [],
      // Enhanced fields
      personality_insights: typeof parsed.personality_insights === 'string' ? parsed.personality_insights : undefined,
      communication_style: typeof parsed.communication_style === 'string' ? parsed.communication_style : undefined,
      rapport_tips: Array.isArray(parsed.rapport_tips)
        ? parsed.rapport_tips.filter((p: unknown) => typeof p === 'string')
        : undefined,
      potential_challenges: Array.isArray(parsed.potential_challenges)
        ? parsed.potential_challenges.filter((p: unknown) => typeof p === 'string')
        : undefined,
      meeting_strategy: typeof parsed.meeting_strategy === 'string' ? parsed.meeting_strategy : undefined,
      follow_up_hooks: Array.isArray(parsed.follow_up_hooks)
        ? parsed.follow_up_hooks.filter((p: unknown) => typeof p === 'string')
        : undefined,
      linkedin_dm_template: typeof parsed.linkedin_dm_template === 'string' ? parsed.linkedin_dm_template : undefined,
      email_template: typeof parsed.email_template === 'string' ? parsed.email_template : undefined,
    };
  } catch (error) {
    throw new GroqError(
      `Failed to parse brief: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
      ERROR_CODES.INTERNAL_ERROR
    );
  }
}

// -------------------- Chat (Groq Fallback) --------------------

export interface ChatContext {
  user: {
    name?: string;
    company?: string;
    role?: string;
    linkedinData?: LinkedInProfileData | null;
  };
  brief?: {
    targetName: string;
    targetRole: string;
    targetCompany: string;
    meetingGoal: MeetingGoal;
    summary: string;
    talking_points: string[];
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * Chat with Sage using Groq
 */
export async function chatWithGroq(
  message: string,
  context: ChatContext,
  modelId?: string
): Promise<string> {
  const systemPrompt = buildSageSystemPrompt(context);
  const model = modelId || DEFAULT_GROQ_MODEL;

  const messages: GroqMessage[] = [
    { role: 'system', content: systemPrompt },
    ...context.conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: message },
  ];

  try {
    return await groqRequest(messages, {
      model,
      maxTokens: 4096,
      temperature: 0.8,
      useTools: model.includes('gpt-oss') || model.includes('compound'),
    });
  } catch (error) {
    if (error instanceof GroqError) {
      throw error;
    }

    throw new GroqError(
      `Chat failed with Groq: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ERROR_CODES.INTERNAL_ERROR
    );
  }
}

function buildSageSystemPrompt(context: ChatContext): string {
  let prompt = `You are Sage, an AI meeting preparation assistant for Prereq.

Your role is to help users prepare for professional meetings by:
1. Providing insights about the people they're meeting
2. Suggesting conversation topics and questions
3. Identifying common ground and connection points
4. Recommending meeting strategies based on goals

Guidelines:
- Be concise and actionable
- Focus on practical advice
- Personalize based on context
- Be encouraging but realistic
- Never make up information about people
- Keep responses under 200 words unless more detail is requested`;

  if (context.user.name) {
    prompt += `\n\nUser Information:`;
    prompt += `\n- Name: ${context.user.name}`;
    if (context.user.role) prompt += `\n- Role: ${context.user.role}`;
    if (context.user.company) prompt += `\n- Company: ${context.user.company}`;
  }

  if (context.brief) {
    prompt += `\n\nCurrent Meeting Context:`;
    prompt += `\n- Meeting with: ${context.brief.targetName}`;
    prompt += `\n- Their role: ${context.brief.targetRole} at ${context.brief.targetCompany}`;
    prompt += `\n- Meeting goal: ${context.brief.meetingGoal}`;
    prompt += `\n- Brief summary: ${context.brief.summary}`;
  }

  return prompt;
}
