import { prisma } from '@/lib/db';

export interface SerializedAIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  createdAt: string;
}

export interface SerializedAIConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messagesCount?: number;
  lastMessage?: string;
}

export class ConversationService {
  /**
   * Creates a new conversation for the user, isolated by tenant and user.
   */
  static async createConversation(
    userId: string,
    tenantId: string | null,
    title = 'New Chat'
  ): Promise<SerializedAIConversation> {
    const conv = await prisma.aIConversation.create({
      data: {
        userId,
        tenantId,
        title: title.slice(0, 80),
      },
    });

    return {
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
    };
  }

  /**
   * Lists conversations belonging strictly to the authenticated user and tenant.
   */
  static async listConversations(
    userId: string,
    tenantId: string | null,
    limit = 25
  ): Promise<SerializedAIConversation[]> {
    const conversations = await prisma.aIConversation.findMany({
      where: {
        userId,
        tenantId: tenantId ?? undefined,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: Math.min(limit, 50),
    });

    return conversations.map((c: any) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      messagesCount: c._count.messages,
      lastMessage: c.messages[0]?.content?.slice(0, 60),
    }));
  }

  /**
   * Retrieves conversation with chronological messages.
   * Throws an error if the user does not own the conversation.
   */
  static async getConversationWithMessages(
    conversationId: string,
    userId: string,
    tenantId: string | null,
    messageLimit = 40
  ): Promise<{ conversation: SerializedAIConversation; messages: SerializedAIMessage[] }> {
    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        userId,
        tenantId: tenantId ?? undefined,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: messageLimit,
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found or access denied.');
    }

    return {
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      },
      messages: conversation.messages.map((m: any) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        metadata: m.metadata,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Renames a conversation owned by the authenticated user.
   */
  static async renameConversation(
    conversationId: string,
    userId: string,
    tenantId: string | null,
    newTitle: string
  ): Promise<SerializedAIConversation> {
    const sanitizedTitle = (newTitle || 'Untitled Chat').trim().slice(0, 80);

    const existing = await prisma.aIConversation.findFirst({
      where: { id: conversationId, userId, tenantId: tenantId ?? undefined },
    });

    if (!existing) {
      throw new Error('Conversation not found or unauthorized.');
    }

    const updated = await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { title: sanitizedTitle, updatedAt: new Date() },
    });

    return {
      id: updated.id,
      title: updated.title,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Deletes a conversation owned by the authenticated user.
   */
  static async deleteConversation(
    conversationId: string,
    userId: string,
    tenantId: string | null
  ): Promise<{ success: boolean }> {
    const existing = await prisma.aIConversation.findFirst({
      where: { id: conversationId, userId, tenantId: tenantId ?? undefined },
    });

    if (!existing) {
      throw new Error('Conversation not found or unauthorized.');
    }

    await prisma.aIConversation.delete({
      where: { id: conversationId },
    });

    return { success: true };
  }

  /**
   * Saves a message to the conversation and touches the conversation updatedAt.
   */
  static async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
  ): Promise<SerializedAIMessage> {
    const message = await prisma.aIMessage.create({
      data: {
        conversationId,
        role,
        content,
        metadata: metadata ? (metadata as any) : undefined,
      },
    });

    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      id: message.id,
      role: message.role as any,
      content: message.content,
      metadata: message.metadata,
      createdAt: message.createdAt.toISOString(),
    };
  }

  /**
   * Automatically derives an informative conversation title from the user's first query.
   */
  static generateTitleFromPrompt(prompt: string): string {
    const clean = prompt.replace(/\s+/g, ' ').trim();
    if (!clean) return 'New Chat';
    if (clean.length <= 40) return clean;
    return clean.slice(0, 37) + '...';
  }
}
