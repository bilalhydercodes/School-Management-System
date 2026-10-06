import { NextResponse } from 'next/server';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { InsightService } from '@/ai/insights/insight.service';
import { AIUserContext } from '@/ai/core/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/ai/insights
 * Returns role-tailored proactive AI insight cards calculated from real database records.
 */
export async function GET() {
  try {
    const auth = await getAuthenticatedContext();
    if (!auth || !auth.userId || !auth.role) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const userContext: AIUserContext = {
      userId: auth.userId,
      role: auth.role,
      tenantId: auth.tenantId,
      name: auth.user?.fullName || auth.user?.firstName || 'User',
      email: auth.user?.email || auth.email,
      permissions: auth.permissions || [],
    };

    const insights = await InsightService.getProactiveInsights(userContext);

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (error: any) {
    console.error('[AI_INSIGHTS_ROUTE_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate proactive insights.' },
      { status: 500 }
    );
  }
}
