// ============================================
// PREREQ - Health Check API
// GET /api/health
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { checkAIHealth } from '@/lib/ai/client';

export async function GET(request: NextRequest) {
  const aiHealth = await checkAIHealth();

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      ai: {
        claude: {
          configured: aiHealth.claude,
          role: 'primary',
        },
        groq: {
          configured: aiHealth.groq,
          role: 'fallback',
        },
      },
      database: {
        supabase: {
          configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        },
      },
      auth: {
        clerk: {
          configured: !!process.env.CLERK_SECRET_KEY,
        },
      },
      linkedin: {
        rapidapi: {
          configured: !!process.env.RAPIDAPI_KEY,
        },
      },
    },
  };

  // Check if critical services are configured
  const criticalServicesOk =
    (aiHealth.claude || aiHealth.groq) && // At least one AI provider
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.CLERK_SECRET_KEY;

  if (!criticalServicesOk) {
    return NextResponse.json(
      { ...health, status: 'degraded' },
      { status: 503 }
    );
  }

  return NextResponse.json(health);
}
