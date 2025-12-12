// ============================================
// PREREQ - Unified AI Client with Fallback
// Primary: Claude (Anthropic)
// Fallback: Groq (Llama 3.1)
// ============================================

import {
  generateBrief as generateBriefClaude,
  chatWithSage as chatWithClaude,
  ClaudeError,
  type ChatContext as ClaudeChatContext,
} from '@/lib/claude/client';

import {
  generateBriefWithGroq,
  chatWithGroq,
  GroqError,
  type ChatContext as GroqChatContext,
} from '@/lib/groq/client';

import { ERROR_CODES } from '@/config/constants';
import type { LinkedInProfileData, MeetingGoal } from '@/types';

// -------------------- Types --------------------

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

export interface BriefGenerationContext {
  targetProfile: LinkedInProfileData;
  userProfile?: LinkedInProfileData | null;
  meetingGoal: MeetingGoal;
  userName?: string;
  userCompany?: string;
  userRole?: string;
}

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

export type AIProvider = 'claude' | 'groq';

export interface AIResponse<T> {
  data: T;
  provider: AIProvider;
  fallbackUsed: boolean;
  modelId?: string;
}

// -------------------- Error Detection --------------------

/**
 * Checks if an error indicates rate limiting or token exhaustion
 */
function isRateLimitOrTokenError(error: unknown): boolean {
  if (error instanceof ClaudeError || error instanceof GroqError) {
    const code = error.code;
    return (
      code === ERROR_CODES.RATE_LIMIT_EXCEEDED ||
      code === 'rate_limit_error' ||
      code === 'overloaded_error'
    );
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('rate_limit') ||
      message.includes('overloaded') ||
      message.includes('capacity') ||
      message.includes('429') ||
      message.includes('token') ||
      message.includes('quota')
    );
  }

  return false;
}

/**
 * Checks if error is recoverable (should try fallback)
 */
function shouldUseFallback(error: unknown): boolean {
  // Rate limits and capacity issues should trigger fallback
  if (isRateLimitOrTokenError(error)) {
    return true;
  }

  // API errors that might be temporary
  if (error instanceof ClaudeError) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    return statusCode === 429 || statusCode === 503 || statusCode === 529;
  }

  return false;
}

// -------------------- Brief Generation with Fallback --------------------

/**
 * Generates a meeting prep brief using Claude with Groq fallback
 */
export async function generateBrief(
  context: BriefGenerationContext
): Promise<AIResponse<GeneratedBrief>> {
  // Try Claude first
  try {
    console.log('[AI] Attempting brief generation with Claude...');
    const brief = await generateBriefClaude(context);
    console.log('[AI] Brief generated successfully with Claude');

    return {
      data: brief,
      provider: 'claude',
      fallbackUsed: false,
    };
  } catch (claudeError) {
    console.error('[AI] Claude error:', claudeError);

    // Check if we should try Groq fallback
    if (shouldUseFallback(claudeError)) {
      console.log('[AI] Rate limit detected, falling back to Groq...');

      try {
        const brief = await generateBriefWithGroq(context);
        console.log('[AI] Brief generated successfully with Groq fallback');

        return {
          data: brief,
          provider: 'groq',
          fallbackUsed: true,
        };
      } catch (groqError) {
        console.error('[AI] Groq fallback also failed:', groqError);
        // If both fail, throw the original Claude error
        throw claudeError;
      }
    }

    // Non-recoverable error, don't try fallback
    throw claudeError;
  }
}

// -------------------- Chat with Fallback --------------------

export interface ChatOptions {
  modelId?: string;
  provider?: AIProvider;
}

/**
 * Chat with Sage AI assistant using specified model or Claude with Groq fallback
 */
export async function chat(
  message: string,
  context: ChatContext,
  options?: ChatOptions
): Promise<AIResponse<string>> {
  const { modelId, provider: preferredProvider } = options || {};

  // If a specific model is requested, use that provider directly
  if (modelId) {
    const isGroqModel = modelId.includes('/') ||
      modelId.startsWith('llama') ||
      modelId.startsWith('qwen') ||
      modelId.startsWith('groq') ||
      modelId.startsWith('openai') ||
      modelId.startsWith('meta-') ||
      modelId.startsWith('moonshot');

    if (isGroqModel || preferredProvider === 'groq') {
      console.log(`[AI] Using Groq with model: ${modelId}`);
      const response = await chatWithGroq(message, context as GroqChatContext, modelId);
      return {
        data: response,
        provider: 'groq',
        fallbackUsed: false,
        modelId,
      };
    } else {
      console.log(`[AI] Using Claude with model: ${modelId}`);
      const response = await chatWithClaude(message, context as ClaudeChatContext, modelId);
      return {
        data: response,
        provider: 'claude',
        fallbackUsed: false,
        modelId,
      };
    }
  }

  // Default behavior: Try Claude first with fallback to Groq
  try {
    console.log('[AI] Attempting chat with Claude...');
    const response = await chatWithClaude(message, context as ClaudeChatContext);
    console.log('[AI] Chat response received from Claude');

    return {
      data: response,
      provider: 'claude',
      fallbackUsed: false,
    };
  } catch (claudeError) {
    console.error('[AI] Claude chat error:', claudeError);

    // Check if we should try Groq fallback
    if (shouldUseFallback(claudeError)) {
      console.log('[AI] Rate limit detected, falling back to Groq for chat...');

      try {
        const response = await chatWithGroq(message, context as GroqChatContext);
        console.log('[AI] Chat response received from Groq fallback');

        return {
          data: response,
          provider: 'groq',
          fallbackUsed: true,
        };
      } catch (groqError) {
        console.error('[AI] Groq chat fallback also failed:', groqError);
        throw claudeError;
      }
    }

    throw claudeError;
  }
}

// -------------------- Direct Provider Access --------------------

/**
 * Force use of a specific provider (useful for testing)
 */
export async function generateBriefWithProvider(
  context: BriefGenerationContext,
  provider: AIProvider
): Promise<GeneratedBrief> {
  if (provider === 'groq') {
    return generateBriefWithGroq(context);
  }
  return generateBriefClaude(context);
}

export async function chatWithProvider(
  message: string,
  context: ChatContext,
  provider: AIProvider
): Promise<string> {
  if (provider === 'groq') {
    return chatWithGroq(message, context as GroqChatContext);
  }
  return chatWithClaude(message, context as ClaudeChatContext);
}

// -------------------- Health Check --------------------

/**
 * Checks AI provider availability
 */
export async function checkAIHealth(): Promise<{
  claude: boolean;
  groq: boolean;
}> {
  const results = {
    claude: false,
    groq: false,
  };

  // Check Claude
  try {
    const claudeKey = process.env.ANTHROPIC_API_KEY;
    results.claude = !!claudeKey && claudeKey.startsWith('sk-ant-');
  } catch {
    results.claude = false;
  }

  // Check Groq
  try {
    const groqKey = process.env.GROQ_API_KEY;
    results.groq = !!groqKey && groqKey.startsWith('gsk_');
  } catch {
    results.groq = false;
  }

  return results;
}
