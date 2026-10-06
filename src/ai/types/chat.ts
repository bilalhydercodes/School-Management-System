import type { AIChatMessage, AIChatRequest, AIChatResponse, AIUserContext, AIDashboardContext } from '../core/types';

export type {
  AIChatMessage,
  AIChatRequest,
  AIChatResponse,
  AIUserContext,
  AIDashboardContext,
};

export interface ChatSessionState {
  conversationId: string;
  messages: AIChatMessage[];
  createdAt: number;
  lastActiveAt: number;
}

export type AICallbackStatus = 'idle' | 'thinking' | 'streaming' | 'error';
