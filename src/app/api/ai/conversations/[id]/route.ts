import { NextResponse } from 'next/server';
import { getAuthenticatedContext } from '@/lib/auth-context';
import { ConversationService } from '@/ai/services/conversation.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/ai/conversations/[id]
 * Fetch single conversation with message history.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedContext();
    if (!auth || !auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing conversation id.' },
        { status: 400 }
      );
    }

    const conversation = await ConversationService.getConversationWithMessages(
      id,
      auth.userId,
      auth.tenant?.id || null
    );

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found or unauthorized.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error: any) {
    console.error('[CONVERSATION_ITEM_GET_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve conversation.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ai/conversations/[id]
 * Rename conversation title.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedContext();
    if (!auth || !auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const newTitle = (body.title || '').trim();

    if (!newTitle) {
      return NextResponse.json(
        { success: false, error: 'Title cannot be empty.' },
        { status: 400 }
      );
    }

    const updated = await ConversationService.renameConversation(
      id,
      auth.userId,
      auth.tenant?.id || null,
      newTitle
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found or unauthorized.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation: updated,
    });
  } catch (error: any) {
    console.error('[CONVERSATION_ITEM_PATCH_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to rename conversation.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/conversations/[id]
 * Delete conversation.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedContext();
    if (!auth || !auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const success = await ConversationService.deleteConversation(
      id,
      auth.userId,
      auth.tenant?.id || null
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found or unauthorized.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully.',
    });
  } catch (error: any) {
    console.error('[CONVERSATION_ITEM_DELETE_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete conversation.' },
      { status: 500 }
    );
  }
}
