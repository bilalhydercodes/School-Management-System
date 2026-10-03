import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Readiness Health Probe.
 * Verifies that critical downstream infrastructure (PostgreSQL database and Redis)
 * is connected and ready to serve user requests safely.
 */
export async function GET() {
  const checks: Record<string, 'ok' | 'error' | 'disabled'> = {
    database: 'error',
    redis: 'disabled',
  };

  let allHealthy = true;

  // 1. Database Connectivity Check
  try {
    const { prisma } = await import('@/lib/db');
    if (prisma) {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } else {
      allHealthy = false;
      checks.database = 'error';
    }
  } catch (err: unknown) {
    allHealthy = false;
    checks.database = 'error';
    console.warn('[HEALTH-CHECK] Database ping failed:', err instanceof Error ? err.message : String(err));
  }

  // 2. Redis Connectivity Check (if configured)
  try {
    const { isRedisAvailable } = await import('@/lib/redis');
    const available = await isRedisAvailable();
    checks.redis = available ? 'ok' : 'disabled';
  } catch {
    checks.redis = 'disabled';
  }

  const statusCode = allHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: allHealthy ? 'ready' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
