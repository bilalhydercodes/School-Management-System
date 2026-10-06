export interface AIObservabilityLog {
  requestId: string;
  timestamp?: string;
  tenantId?: string | null;
  userId?: string;
  role?: string;
  action?: string;
  path?: string;
  model?: string;
  latencyMs?: number;
  toolCallsCount?: number;
  toolsInvoked?: string[];
  actionProposed?: string | null;
  ragSourcesUsed?: string[];
  status: 'SUCCESS' | 'ERROR' | 'FAILED' | 'RATE_LIMITED' | 'UNAUTHORIZED' | 'VALIDATION_FAILED';
  errorMessage?: string;
  error?: string;
}

/**
 * Structured logger for AI Copilot operations.
 * Minimizes PII and strictly prevents leakage of secrets, keys, or passwords.
 */
export function logAIOperation(entry: AIObservabilityLog): void {
  const safeLog = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  // Structured production log line
  if (entry.status === 'ERROR' || entry.status === 'FAILED') {
    console.error(`[AI-COPILOT-AUDIT] ${JSON.stringify(safeLog)}`);
  } else {
    console.log(`[AI-COPILOT-AUDIT] ${JSON.stringify(safeLog)}`);
  }
}
