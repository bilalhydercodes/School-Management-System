export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  RATE_LIMIT = 'RATE_LIMIT',
  AI = 'AI',
  FILE_UPLOAD = 'FILE_UPLOAD',
  PAYMENT = 'PAYMENT',
  TENANT = 'TENANT',
  SYSTEM = 'SYSTEM',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface ErrorOptions {
  code?: string;
  userMessage?: string;
  statusCode?: number;
  severity?: ErrorSeverity;
  retryable?: boolean;
  cause?: unknown;
  metadata?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly statusCode: number;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly retryable: boolean;
  public readonly cause?: unknown;
  public readonly metadata?: Record<string, unknown>;
  public readonly requestId?: string;

  constructor(category: ErrorCategory, message: string, options: ErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    
    this.category = category;
    this.code = options.code || category;
    this.userMessage = options.userMessage || getDefaultUserMessage(category);
    this.statusCode = options.statusCode || getDefaultStatusCode(category);
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.retryable = options.retryable ?? getDefaultRetryable(category);
    this.cause = options.cause;
    this.metadata = options.metadata;

    Error.captureStackTrace(this, this.constructor);
  }
}

function getDefaultUserMessage(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return 'You need to sign in to continue.';
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.TENANT:
      return 'You do not have permission to perform this action.';
    case ErrorCategory.NOT_FOUND:
      return 'We could not find the requested information.';
    case ErrorCategory.VALIDATION:
      return 'Please check the highlighted fields and try again.';
    case ErrorCategory.NETWORK:
      return 'We could not connect to the server. Please check your connection and try again.';
    case ErrorCategory.DATABASE:
      return 'We are having trouble loading this information right now. Please try again.';
    case ErrorCategory.EXTERNAL_SERVICE:
      return 'This service is temporarily unavailable. Please try again shortly.';
    case ErrorCategory.RATE_LIMIT:
      return 'You are doing that too often. Please wait a moment before trying again.';
    case ErrorCategory.CONFLICT:
      return 'There was a conflict with your request. This record may already exist or was modified.';
    case ErrorCategory.AI:
      return 'Alpha AI is temporarily unavailable. Please try again.';
    case ErrorCategory.UNKNOWN:
    case ErrorCategory.SYSTEM:
    default:
      return 'Something went wrong while processing your request. Please try again.';
  }
}

function getDefaultStatusCode(category: ErrorCategory): number {
  switch (category) {
    case ErrorCategory.VALIDATION: return 400;
    case ErrorCategory.AUTHENTICATION: return 401;
    case ErrorCategory.AUTHORIZATION: return 403;
    case ErrorCategory.TENANT: return 403;
    case ErrorCategory.NOT_FOUND: return 404;
    case ErrorCategory.CONFLICT: return 409;
    case ErrorCategory.RATE_LIMIT: return 429;
    case ErrorCategory.EXTERNAL_SERVICE: return 502;
    case ErrorCategory.DATABASE: return 500;
    case ErrorCategory.NETWORK: return 503;
    case ErrorCategory.UNKNOWN:
    case ErrorCategory.SYSTEM:
    default: return 500;
  }
}

function getDefaultRetryable(category: ErrorCategory): boolean {
  switch (category) {
    case ErrorCategory.NETWORK:
    case ErrorCategory.EXTERNAL_SERVICE:
    case ErrorCategory.RATE_LIMIT:
    case ErrorCategory.DATABASE:
    case ErrorCategory.AI:
      return true;
    default:
      return false;
  }
}
