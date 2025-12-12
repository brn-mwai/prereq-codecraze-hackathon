// ============================================
// PREREQ - AI Model Configuration
// Supported providers: Claude (Anthropic), Groq
// ============================================

export type AIProvider = 'claude' | 'groq';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  contextWindow: number;
  maxOutput: number;
  supportsTools?: boolean;
  supportsVision?: boolean;
  isRecommended?: boolean;
  isFast?: boolean;
  category: 'chat' | 'reasoning' | 'code' | 'multimodal';
}

// -------------------- Claude Models --------------------
export const CLAUDE_MODELS: AIModel[] = [
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'claude',
    description: 'Best balance of intelligence and speed',
    contextWindow: 200000,
    maxOutput: 8192,
    supportsTools: true,
    supportsVision: true,
    isRecommended: true,
    category: 'chat',
  },
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    provider: 'claude',
    description: 'Most capable model for complex tasks',
    contextWindow: 200000,
    maxOutput: 8192,
    supportsTools: true,
    supportsVision: true,
    category: 'reasoning',
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'claude',
    description: 'Fastest Claude model for quick tasks',
    contextWindow: 200000,
    maxOutput: 8192,
    supportsTools: true,
    supportsVision: true,
    isFast: true,
    category: 'chat',
  },
];

// -------------------- Groq Models --------------------
export const GROQ_MODELS: AIModel[] = [
  // OpenAI OSS Models (via Groq)
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B',
    provider: 'groq',
    description: 'Large open-source GPT model with reasoning',
    contextWindow: 131072,
    maxOutput: 8192,
    supportsTools: true,
    isRecommended: true,
    category: 'reasoning',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
    provider: 'groq',
    description: 'Efficient open-source GPT model',
    contextWindow: 131072,
    maxOutput: 8192,
    supportsTools: true,
    isFast: true,
    category: 'chat',
  },
  // Groq Compound Models
  {
    id: 'groq/compound',
    name: 'Groq Compound',
    provider: 'groq',
    description: 'Groq compound AI system',
    contextWindow: 131072,
    maxOutput: 8192,
    supportsTools: true,
    category: 'reasoning',
  },
  {
    id: 'groq/compound-mini',
    name: 'Groq Compound Mini',
    provider: 'groq',
    description: 'Faster compound AI system',
    contextWindow: 131072,
    maxOutput: 8192,
    supportsTools: true,
    isFast: true,
    category: 'chat',
  },
  // Qwen Models
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen3 32B',
    provider: 'groq',
    description: 'Alibaba Qwen3 model',
    contextWindow: 131072,
    maxOutput: 8192,
    category: 'chat',
  },
  // Meta Llama Models
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    description: 'Ultra-fast Llama model',
    contextWindow: 131072,
    maxOutput: 8192,
    isFast: true,
    category: 'chat',
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'groq',
    description: 'Versatile large Llama model',
    contextWindow: 131072,
    maxOutput: 8192,
    isRecommended: true,
    category: 'chat',
  },
  {
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    name: 'Llama 4 Maverick 17B',
    provider: 'groq',
    description: 'Latest Llama 4 Maverick model',
    contextWindow: 131072,
    maxOutput: 8192,
    category: 'chat',
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    provider: 'groq',
    description: 'Llama 4 Scout for exploration tasks',
    contextWindow: 131072,
    maxOutput: 8192,
    category: 'chat',
  },
  // Moonshot AI
  {
    id: 'moonshotai/kimi-k2-instruct-0905',
    name: 'Kimi K2 Instruct',
    provider: 'groq',
    description: 'Moonshot AI Kimi K2 model',
    contextWindow: 131072,
    maxOutput: 8192,
    category: 'chat',
  },
];

// -------------------- All Models --------------------
export const ALL_MODELS: AIModel[] = [...CLAUDE_MODELS, ...GROQ_MODELS];

// -------------------- Helper Functions --------------------

export function getModelById(modelId: string): AIModel | undefined {
  return ALL_MODELS.find((m) => m.id === modelId);
}

export function getModelsByProvider(provider: AIProvider): AIModel[] {
  return ALL_MODELS.filter((m) => m.provider === provider);
}

export function getRecommendedModels(): AIModel[] {
  return ALL_MODELS.filter((m) => m.isRecommended);
}

export function getFastModels(): AIModel[] {
  return ALL_MODELS.filter((m) => m.isFast);
}

export function getDefaultModel(provider?: AIProvider): AIModel {
  if (provider === 'groq') {
    return GROQ_MODELS.find((m) => m.isRecommended) || GROQ_MODELS[0];
  }
  return CLAUDE_MODELS.find((m) => m.isRecommended) || CLAUDE_MODELS[0];
}

// -------------------- Model Groups for UI --------------------
export const MODEL_GROUPS = [
  {
    label: 'Anthropic Claude',
    provider: 'claude' as AIProvider,
    models: CLAUDE_MODELS,
  },
  {
    label: 'Groq - OpenAI OSS',
    provider: 'groq' as AIProvider,
    models: GROQ_MODELS.filter((m) => m.id.startsWith('openai/')),
  },
  {
    label: 'Groq - Compound',
    provider: 'groq' as AIProvider,
    models: GROQ_MODELS.filter((m) => m.id.startsWith('groq/')),
  },
  {
    label: 'Groq - Meta Llama',
    provider: 'groq' as AIProvider,
    models: GROQ_MODELS.filter((m) => m.id.includes('llama')),
  },
  {
    label: 'Groq - Other',
    provider: 'groq' as AIProvider,
    models: GROQ_MODELS.filter(
      (m) =>
        !m.id.startsWith('openai/') &&
        !m.id.startsWith('groq/') &&
        !m.id.includes('llama')
    ),
  },
];
