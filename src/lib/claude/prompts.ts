// ============================================
// PREREQ - Claude Prompt Templates
// ============================================

import type { MeetingGoal } from '@/types';

/**
 * Goal-specific prompt additions for brief generation
 */
export const GOAL_PROMPTS: Record<MeetingGoal, string> = {
  networking: `Focus on:
- Shared interests and experiences for genuine connection
- Industry trends you both might care about
- Mutual connections and communities
- Non-transactional conversation starters`,

  sales: `Focus on:
- Their company's potential pain points
- Recent company news or initiatives
- Budget cycle and decision-making process hints
- Value-focused talking points
- Questions that uncover needs`,

  hiring: `Focus on:
- Their career trajectory and growth patterns
- Culture fit indicators
- Skills and experience highlights
- Questions about their motivations and goals
- Red flags or areas to explore`,

  investor: `Focus on:
- Their investment thesis and portfolio
- Recent investments and why
- What metrics they care about
- How to frame your opportunity
- Questions about their process`,

  partner: `Focus on:
- Mutual value creation opportunities
- Their business model and goals
- Potential synergies
- Trust-building talking points
- Questions about their priorities`,

  general: `Focus on:
- Professional common ground
- Interesting conversation topics
- Building rapport
- Thoughtful questions`,
};

/**
 * Chat suggestion prompts for Sage
 */
export const SAGE_SUGGESTIONS = {
  withBrief: [
    'What should I focus on in this meeting?',
    'Give me more icebreakers',
    'What questions should I avoid?',
    'How can I make a good impression?',
    'What do we have in common?',
  ],
  withoutBrief: [
    'Help me prepare for a meeting',
    'Tips for meeting with a VC',
    'How to network effectively',
    'Sales meeting best practices',
    'Interview preparation tips',
  ],
};

/**
 * Error-recovery prompts
 */
export const ERROR_RECOVERY_PROMPTS = {
  briefGeneration: `The previous response wasn't in the correct format. Please generate the meeting brief again, ensuring you respond ONLY with valid JSON in this exact format:
{
  "summary": "2-3 sentence summary",
  "talking_points": ["point 1", "point 2", "point 3"],
  "common_ground": ["connection 1", "connection 2"],
  "icebreaker": "specific conversation opener",
  "questions": ["question 1", "question 2", "question 3"]
}`,
};
