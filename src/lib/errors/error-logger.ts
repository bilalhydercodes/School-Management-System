import { AppError, ErrorSeverity } from './AppError';

// A simple utility to log structured errors
// In production, this should integrate with Datadog, Sentry, Axiom, etc.

export interface ErrorLogPayload {
  error: AppError | Error;
  requestId?: string;
  userId?: string;
  tenantId?: string;
  context?: string;
  metadata?: Record<string, unknown>;
}

export const logger = {
  error: (payload: ErrorLogPayload) => {
    // Determine severity
    const isAppError = payload.error instanceof AppError;
    const severity = isAppError ? payload.error.severity : ErrorSeverity.ERROR;
    
    // Only log WARNING and above as actual errors
    if (severity === ErrorSeverity.INFO) {
      console.log(formatLog(payload));
    } else if (severity === ErrorSeverity.WARNING) {
      console.warn(formatLog(payload));
    } else {
      console.error(formatLog(payload));
    }

    // TODO: Send to external monitoring service
  },
  
  warn: (payload: Omit<ErrorLogPayload, 'error'> & { message: string }) => {
    console.warn(`[WARN] [${payload.requestId || 'NO-REQ-ID'}] ${payload.message}`);
  },

  info: (payload: Omit<ErrorLogPayload, 'error'> & { message: string }) => {
    console.info(`[INFO] [${payload.requestId || 'NO-REQ-ID'}] ${payload.message}`);
  }
};

function formatLog(payload: ErrorLogPayload): string {
  const { error, requestId, userId, tenantId, context, metadata } = payload;
  const isAppError = error instanceof AppError;
  
  const logObj = {
    timestamp: new Date().toISOString(),
    requestId,
    userId,
    tenantId,
    context,
    name: error.name,
    message: error.message,
    category: isAppError ? error.category : 'UNHANDLED_EXCEPTION',
    code: isAppError ? error.code : 'UNKNOWN',
    userMessage: isAppError ? error.userMessage : undefined,
    stack: error.stack,
    cause: isAppError && error.cause ? error.cause : undefined,
    metadata: { ...metadata, ...(isAppError ? error.metadata : {}) }
  };

  // Stringify the log object safely
  return JSON.stringify(logObj);
}
