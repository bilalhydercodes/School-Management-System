import { NextResponse } from 'next/server';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { ConversationService } from '@/ai/services/conversation.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/ai/conversations
 * Lists recent conversations for the authenticated user within their tenant.
 */
export async function GET() {
  try {
    const auth = await getAuthenticatedContext();
    if (!auth || !auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    if (!auth.tenant?.id) {
      return NextResponse.json(
        { success: false, error: 'Tenant context missing.' },
        { status: 400 }
      );
    }

    const conversations = await ConversationService.listConversations(
      auth.userId,
      auth.tenant.id
    );

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error: any) {
    console.error('[CONVERSATIONS_GET_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/conversations
 * Creates a new conversation.
 */
export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedContext();
    if (!auth || !auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    if (!auth.tenant?.id) {
      return NextResponse.json(
        { success: false, error: 'Tenant context missing.' },
        { status: 400 }
      );
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const title = typeof body?.title === 'string' && body.title.trim()
      ? body.title.trim().slice(0, 100)
      : 'New Conversation';

    const conversation = await ConversationService.createConversation(
      auth.userId,
      auth.tenant.id,
      title
    );

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error: any) {
    console.error('[CONVERSATIONS_POST_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation.' },
      { status: 500 }
    );
  }
}
