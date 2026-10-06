import { buildAIDashboardContext } from '../core/context';
import type { AIUserContext, AIDashboardContext } from '../core/types';

/**
 * ContextService
 * Orchestrates retrieving and caching user & dashboard context for AI Copilot sessions.
 */
export class ContextService {
  /**
   * Retrieves tenant-isolated dashboard context for the authenticated user session.
   */
  public static async getContextForSession(
    userContext: AIUserContext
  ): Promise<AIDashboardContext> {
    return buildAIDashboardContext(userContext);
  }
}
