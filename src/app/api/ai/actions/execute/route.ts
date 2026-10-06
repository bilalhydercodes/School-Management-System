import { NextResponse } from 'next/server';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { executeAIAction } from '@/ai/actions';
import { ActionType } from '@/ai/actions/types';
import { logAIOperation } from '@/ai/observability/logger';
import { AIUserContext } from '@/ai/core/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/ai/actions/execute
 * Confirms and executes an AI proposed action.
 * Double-checks server authorization and tenant isolation.
 */
export async function POST(request: Request) {
  const startTime = Date.now();
  let actionType: ActionType | undefined;

  try {
    const auth = await getAuthenticatedContext();
    if (!auth || !auth.userId || !auth.role) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Session required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    actionType = body.actionType as ActionType;
    const payload = body.payload || {};

    if (!actionType) {
      return NextResponse.json(
        { success: false, error: 'Missing actionType in payload.' },
        { status: 400 }
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

    const result = await executeAIAction(userContext, actionType, payload);

    logAIOperation({
      requestId: `act_${Date.now()}`,
      action: 'action_execution',
      role: auth.role,
      tenantId: auth.tenant?.id,
      latencyMs: Date.now() - startTime,
      toolsInvoked: [actionType],
      status: result.success ? 'SUCCESS' : 'FAILED',
      errorMessage: result.error,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message, code: result.error },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    console.error('[ACTION_EXECUTE_ROUTE_ERROR]:', error);
    logAIOperation({
      requestId: `act_err_${Date.now()}`,
      action: 'action_execution',
      latencyMs: Date.now() - startTime,
      toolsInvoked: actionType ? [actionType] : [],
      status: 'FAILED',
      errorMessage: error?.message,
    });

    return NextResponse.json(
      { success: false, error: error?.message || 'Action execution failed.' },
      { status: 500 }
    );
  }
}
