// ============================================
// PREREQ - Claude AI Client
// ============================================

import Anthropic from '@anthropic-ai/sdk';
import { ERROR_CODES, API_CONFIG } from '@/config/constants';
import type { LinkedInProfileData, MeetingGoal, User } from '@/types';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class ClaudeError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'ClaudeError';
    this.code = code;
  }
}

// -------------------- Brief Generation --------------------

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
 * Generates a meeting prep brief using Claude
 */
export async function generateBrief(
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
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new ClaudeError('Unexpected response format', ERROR_CODES.CLAUDE_ERROR);
    }

    // Parse the JSON response
    const brief = parseGeneratedBrief(content.text);
    return brief;
  } catch (error) {
    if (error instanceof ClaudeError) {
      throw error;
    }

    throw new ClaudeError(
      `Failed to generate brief: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ERROR_CODES.CLAUDE_ERROR
    );
  }
}

function buildBriefSystemPrompt(): string {
  return `You are an elite executive coach and meeting strategist with expertise in professional psychology, persuasion, and relationship building. Your job is to analyze LinkedIn profiles and generate comprehensive, highly actionable meeting briefs that give the user an unfair advantage.

You must respond ONLY with valid JSON in exactly this format:
{
  "summary": "A compelling 2-3 sentence executive summary highlighting WHO they are, their POWER/INFLUENCE level, KEY achievements, and what drives them professionally",
  "personality_insights": "Based on their career trajectory, content, and choices - what type of person are they? Are they analytical, creative, relationship-focused, results-driven? What motivates them?",
  "communication_style": "How should you communicate with this person? Are they likely to prefer data/facts, stories/vision, relationship-building, or getting straight to business?",
  "talking_points": ["5-7 highly specific, researched talking points that demonstrate you've done your homework"],
  "common_ground": ["3-5 genuine connection points - be creative: industry overlaps, shared challenges, mutual connections, similar career paths, geographic connections, school overlaps, skill intersections"],
  "rapport_tips": ["3 specific techniques to build rapport with THIS person based on their profile"],
  "potential_challenges": ["2-3 potential objections, concerns, or friction points to be prepared for"],
  "meeting_strategy": "A tactical 2-3 sentence strategy for how to approach this meeting for maximum success given the goal",
  "icebreaker": "A brilliant, personalized conversation opener that shows genuine research and creates immediate connection - NOT generic",
  "questions": ["5 thoughtful questions that show deep research and genuine curiosity - questions they'll WANT to answer"],
  "follow_up_hooks": ["3 specific things you could follow up on after the meeting to stay top-of-mind"],
  "linkedin_dm_template": "A warm, personalized LinkedIn DM template (under 300 chars) that feels authentic and gets responses",
  "email_template": "A professional email template that's personalized, references something specific about them, and has a clear CTA"
}

CRITICAL GUIDELINES:
- Be SPECIFIC. Generic advice is useless. Every point should reference something from their actual profile.
- Be STRATEGIC. Think like a master networker. What angles give the user leverage?
- Be INSIGHTFUL. Read between the lines. Career jumps, company choices, skill development all tell a story.
- Be PRACTICAL. Everything should be immediately actionable.
- Find HIDDEN GEMS. Look for non-obvious connections - volunteer work, side projects, posts, endorsements.
- Consider TIMING. Recent job changes, promotions, or company news are goldmines.
- Think PSYCHOLOGY. What does their career path say about their values and decision-making?

Your brief should make the user feel like they have an UNFAIR ADVANTAGE walking into this meeting.`;
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

**Recent Activity:**
${formatActivities(targetProfile.activities?.slice(0, 3))}
`;

  // Add user context if available
  if (userProfile || userName) {
    prompt += `\n**About Me (the person preparing for the meeting):**`;

    if (userName) {
      prompt += `\n- Name: ${userName}`;
    }
    if (userCompany) {
      prompt += `\n- Company: ${userCompany}`;
    }
    if (userRole) {
      prompt += `\n- Role: ${userRole}`;
    }

    if (userProfile) {
      prompt += `\n- Headline: ${userProfile.headline || 'N/A'}`;
      prompt += `\n- Skills: ${userProfile.skills?.slice(0, 5).join(', ') || 'N/A'}`;

      if (userProfile.experiences?.length) {
        const currentJob = userProfile.experiences[0];
        prompt += `\n- Current Role: ${currentJob.title} at ${currentJob.company}`;
      }

      if (userProfile.education?.length) {
        const school = userProfile.education[0];
        prompt += `\n- Education: ${school.school}${school.field_of_study ? ` (${school.field_of_study})` : ''}`;
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

function formatExperiences(
  experiences?: LinkedInProfileData['experiences']
): string {
  if (!experiences?.length) return 'N/A';

  return experiences
    .map((exp) => {
      const duration = exp.ends_at
        ? `${exp.starts_at?.year || '?'} - ${exp.ends_at.year}`
        : `${exp.starts_at?.year || '?'} - Present`;
      return `- ${exp.title} at ${exp.company} (${duration})${exp.description ? `\n  ${exp.description.slice(0, 200)}...` : ''}`;
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

function formatActivities(
  activities?: LinkedInProfileData['activities']
): string {
  if (!activities?.length) return 'No recent public activity';

  return activities
    .map((act) => `- ${act.title} (${act.activity_status})`)
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

    // Validate required fields
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
    throw new ClaudeError(
      `Failed to parse brief: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
      ERROR_CODES.CLAUDE_ERROR
    );
  }
}

// -------------------- Chat (Sage Assistant) --------------------

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
 * Chat with Sage (AI assistant) for meeting prep help
 */
export async function chatWithSage(
  message: string,
  context: ChatContext,
  modelId?: string
): Promise<string> {
  const systemPrompt = buildSageSystemPrompt(context);
  const model = modelId || 'claude-sonnet-4-20250514';

  const messages = [
    ...context.conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user' as const,
      content: message,
    },
  ];

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new ClaudeError('Unexpected response format', ERROR_CODES.CLAUDE_ERROR);
    }

    return content.text;
  } catch (error) {
    if (error instanceof ClaudeError) {
      throw error;
    }

    throw new ClaudeError(
      `Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ERROR_CODES.CLAUDE_ERROR
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

  // Add user context
  if (context.user.name) {
    prompt += `\n\nUser Information:`;
    prompt += `\n- Name: ${context.user.name}`;
    if (context.user.role) prompt += `\n- Role: ${context.user.role}`;
    if (context.user.company) prompt += `\n- Company: ${context.user.company}`;
  }

  // Add brief context if available
  if (context.brief) {
    prompt += `\n\nCurrent Meeting Context:`;
    prompt += `\n- Meeting with: ${context.brief.targetName}`;
    prompt += `\n- Their role: ${context.brief.targetRole} at ${context.brief.targetCompany}`;
    prompt += `\n- Meeting goal: ${context.brief.meetingGoal}`;
    prompt += `\n- Brief summary: ${context.brief.summary}`;
    prompt += `\n- Key talking points: ${context.brief.talking_points.slice(0, 3).join('; ')}`;
  }

  return prompt;
}
