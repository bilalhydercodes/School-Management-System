import { getGroqClient } from '../core/client';
import { AI_CONFIG, isGroqConfigured } from '../core/config';
import { buildSystemPrompt } from '../core/system-prompt';
import { ContextService } from './context.service';
import { checkRateLimit, validateChatMessage } from '../security/authorization';
import { getGroqToolsForRole, executeTool } from '../tools';
import { RAGService } from '../rag/rag.service';
import { ConversationService } from './conversation.service';
import { logAIOperation } from '../observability/logger';
import type { UICard, UIAction } from '../tools/types';
import type { ActionProposal } from '../actions/types';
import type {
  AIUserContext,
  AIChatRequest,
  AIChatResponse,
} from '../core/types';

const MAX_TOOL_CALL_ROUNDS = 4;

export class ChatService {
  /**
   * Processes a user chat request against the Groq API with live server-side tool calling,
   * RAG institutional retrieval, conversation persistence, and safe action proposals.
   */
  public static async processMessage(
    userContext: AIUserContext,
    request: AIChatRequest
  ): Promise<AIChatResponse> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { userId, tenantId, role } = userContext;
    const toolsInvokedList: string[] = [];

    // 1. Validate Input Message
    const validation = validateChatMessage(request.message);
    if (!validation.valid || !validation.cleanMessage) {
      logAIOperation({
        requestId,
        userId,
        role,
        tenantId,
        action: 'chat_request',
        latencyMs: Date.now() - startTime,
        status: 'VALIDATION_FAILED',
        errorMessage: validation.error || 'Invalid message',
      });
      return {
        success: false,
        error: validation.error || 'Invalid message content.',
      };
    }
    const cleanMessage = validation.cleanMessage;

    // 2. Check User Rate Limit
    const rateCheck = checkRateLimit(userId);
    if (!rateCheck.allowed) {
      logAIOperation({
        requestId,
        userId,
        role,
        tenantId,
        action: 'chat_request',
        latencyMs: Date.now() - startTime,
        status: 'RATE_LIMITED',
      });
      return {
        success: false,
        error: `You've sent too many messages in a short time. Please wait ${rateCheck.retryAfterSeconds}s before trying again.`,
      };
    }

    // 3. Verify Groq API Configuration
    if (!isGroqConfigured()) {
      return {
        success: false,
        error:
          'Alpha AI Copilot is currently offline: GROQ_API_KEY has not been configured in server environment variables.',
      };
    }

    // 4. Conversation Management & Persistence
    let activeConversationId = request.conversationId;
    if (!activeConversationId || activeConversationId.startsWith('temp_')) {
      try {
        const title = ConversationService.generateTitleFromPrompt(cleanMessage);
        const newConv = await ConversationService.createConversation(
          userId,
          tenantId,
          title
        );
        activeConversationId = newConv.id;
      } catch (convErr) {
        console.warn('[CONVERSATION PERSISTENCE WARNING] Could not create new conversation record:', convErr);
      }
    }

    // Save user's message to conversation
    if (activeConversationId) {
      try {
        await ConversationService.saveMessage(activeConversationId, 'user', cleanMessage);
      } catch (saveErr) {
        console.warn('[CONVERSATION PERSISTENCE WARNING] Could not persist user message:', saveErr);
      }
    }

    // 5. Build Real Dashboard Context for User
    let dashboardContext;
    try {
      dashboardContext = await ContextService.getContextForSession({
        ...userContext,
        currentPath: request.currentPath || userContext.currentPath,
      });
    } catch (dbError) {
      console.error('[CHAT SERVICE ERROR] Context assembly failed:', dbError);
      return {
        success: false,
        error: 'Unable to load live school data context right now. Please try again shortly.',
      };
    }

    // 6. RAG Retrieval for Institutional Policies & Handbook
    const ragResult = RAGService.retrieveRelevantKnowledge(cleanMessage);
    const sourcesToReturn = ragResult.citations.map((c) => ({
      documentName: c.title,
      category: c.category,
      sourceCitation: c.citation,
    }));

    // 7. Build Dynamic System Prompt with RAG knowledge boundary if relevant
    let systemPrompt = buildSystemPrompt(dashboardContext);
    if (ragResult.hasRelevantKnowledge && ragResult.augmentedPromptSnippet) {
      systemPrompt += `\n\n${ragResult.augmentedPromptSnippet}`;
    }

    // 8. Retrieve Authorized Role Tools for Function Calling
    const groqTools = getGroqToolsForRole(userContext.role);

    // 9. Assemble Conversation History (Sliding window of last 6 messages to prevent token blowout)
    const groqMessages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (Array.isArray(request.history)) {
      const recentHistory = request.history.slice(-AI_CONFIG.maxHistoryMessages);
      for (const msg of recentHistory) {
        if (
          (msg.role === 'user' || msg.role === 'assistant') &&
          typeof msg.content === 'string' &&
          msg.content.trim().length > 0
        ) {
          groqMessages.push({
            role: msg.role,
            content: msg.content.trim().slice(0, AI_CONFIG.maxMessageLength),
          });
        }
      }
    }

    groqMessages.push({
      role: 'user',
      content: cleanMessage,
    });

    // 10. Multi-Step Tool Calling Loop
    const collectedCards: UICard[] = [];
    const collectedActions: UIAction[] = [];
    let collectedActionProposal: ActionProposal | undefined;
    let totalToolsCalled = 0;
    let finalAssistantReply = '';

    try {
      const groq = getGroqClient();

      for (let round = 0; round < MAX_TOOL_CALL_ROUNDS; round++) {
        const completion = await groq.chat.completions.create({
          model: AI_CONFIG.model,
          messages: groqMessages,
          tools: groqTools.length > 0 ? (groqTools as any) : undefined,
          tool_choice: groqTools.length > 0 ? 'auto' : undefined,
          temperature: AI_CONFIG.temperature,
          max_tokens: AI_CONFIG.maxOutputTokens,
          top_p: AI_CONFIG.topP,
        });

        const choice = completion.choices[0];
        if (!choice || !choice.message) {
          break;
        }

        const message = choice.message;
        const toolCalls = message.tool_calls;

        // If the model requested tool executions
        if (Array.isArray(toolCalls) && toolCalls.length > 0) {
          groqMessages.push({
            role: 'assistant',
            content: message.content || '',
            tool_calls: toolCalls,
          });

          for (const tc of toolCalls) {
            totalToolsCalled++;
            const toolName = tc.function.name;
            toolsInvokedList.push(toolName);
            let args: Record<string, unknown> = {};

            try {
              if (tc.function.arguments) {
                args = JSON.parse(tc.function.arguments);
              }
            } catch (parseErr) {
              console.warn(`[TOOL ARGS PARSE WARNING] Failed to parse args for ${toolName}:`, parseErr);
            }

            // Execute the secure server-side tool
            const result = await executeTool(toolName, args, userContext);

            if (result.uiCard) {
              collectedCards.push(result.uiCard);
            }
            if (Array.isArray(result.uiActions)) {
              collectedActions.push(...result.uiActions);
            }
            if (result.actionProposal) {
              collectedActionProposal = result.actionProposal as ActionProposal;
            }

            // Append tool execution response to message chain
            groqMessages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify(result.success ? result.data : { error: result.error }),
            });
          }

          continue;
        }

        // If no tool calls returned, we have the final textual response
        finalAssistantReply = message.content?.trim() || '';
        break;
      }

      if (!finalAssistantReply) {
        finalAssistantReply =
          'I have checked your verified school records. Please review the relevant details above.';
      }

      // Append citations if RAG provided knowledge and model did not explicitly mention citation
      if (sourcesToReturn.length > 0 && !finalAssistantReply.toLowerCase().includes('source:')) {
        const citationStrings = sourcesToReturn.map((s) => s.sourceCitation).join(' | ');
        finalAssistantReply += `\n\n*${citationStrings}*`;
      }

      // De-duplicate actions by path
      const uniqueActions: UIAction[] = [];
      const seenPaths = new Set<string>();
      for (const act of collectedActions) {
        if (!seenPaths.has(act.path)) {
          seenPaths.add(act.path);
          uniqueActions.push(act);
        }
      }

      // Save assistant reply to conversation
      if (activeConversationId) {
        try {
          await ConversationService.saveMessage(activeConversationId, 'assistant', finalAssistantReply, {
            uiCards: collectedCards.length > 0 ? collectedCards : undefined,
            uiActions: uniqueActions.length > 0 ? uniqueActions : undefined,
            sources: sourcesToReturn.length > 0 ? sourcesToReturn : undefined,
            actionProposal: collectedActionProposal || undefined,
          });
        } catch (saveErr) {
          console.warn('[CONVERSATION PERSISTENCE WARNING] Could not persist assistant message:', saveErr);
        }
      }

      // Log structured observability event
      logAIOperation({
        requestId,
        userId,
        role,
        tenantId,
        action: 'chat_request',
        model: AI_CONFIG.model,
        latencyMs: Date.now() - startTime,
        toolsInvoked: toolsInvokedList,
        status: 'SUCCESS',
      });

      return {
        success: true,
        message: finalAssistantReply,
        conversationId: activeConversationId || `conv_${Date.now()}`,
        role: userContext.role,
        timestamp: new Date().toISOString(),
        sources: sourcesToReturn.length > 0 ? sourcesToReturn : undefined,
        actionProposal: collectedActionProposal,
        uiCards: collectedCards.length > 0 ? collectedCards : undefined,
        uiActions: uniqueActions.length > 0 ? uniqueActions : undefined,
        toolCallsCount: totalToolsCalled,
      };
    } catch (err: any) {
      console.error('[GROQ TOOL EXECUTION COMPLETION ERROR]:', {
        name: err?.name,
        message: err?.message,
        status: err?.status,
        code: err?.code,
      });

      logAIOperation({
        requestId,
        userId,
        role,
        tenantId,
        action: 'chat_request',
        model: AI_CONFIG.model,
        latencyMs: Date.now() - startTime,
        toolsInvoked: toolsInvokedList,
        status: 'FAILED',
        errorMessage: err?.message || 'Groq completion error',
      });

      if (err?.status === 429 || err?.code === 'rate_limit_exceeded') {
        return {
          success: false,
          error:
            'The AI assistant is experiencing high traffic right now. Please wait a moment and try again.',
        };
      }

      if (err?.status === 401 || err?.code === 'invalid_api_key') {
        return {
          success: false,
          error:
            'AI service authorization failed. Please contact the system administrator to verify the API key configuration.',
        };
      }

      if (err?.name === 'APIConnectionTimeoutError' || err?.code === 'ETIMEDOUT') {
        return {
          success: false,
          error: 'The AI service took too long to respond. Please try asking again.',
        };
      }

      return {
        success: false,
        error:
          'Unable to reach Alpha AI Copilot at this moment. Please check your connection and try again.',
      };
    }
  }
}
