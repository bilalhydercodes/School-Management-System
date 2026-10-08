import { AppError, ErrorCategory, ErrorSeverity } from './AppError';
import { logger } from './error-logger';

// Prisma error code mapping
// Reference: https://www.prisma.io/docs/reference/api-reference/error-reference

export function handlePrismaError(error: any): AppError {
  if (error.name === 'PrismaClientKnownRequestError') {
    switch (error.code) {
      case 'P2002':
        // Unique constraint failed
        const target = (error.meta?.target as string[])?.join(', ') || 'field';
        return new AppError(ErrorCategory.CONFLICT, 'Unique constraint violation', {
          code: 'DB_CONFLICT',
          userMessage: `This record could not be saved because a record with this ${target} already exists.`,
          cause: error,
          metadata: { target }
        });
      
      case 'P2025':
        // Record not found
        return new AppError(ErrorCategory.NOT_FOUND, 'Record not found in database', {
          code: 'DB_NOT_FOUND',
          userMessage: 'We could not find the information you requested.',
          cause: error,
        });

      case 'P2003':
        // Foreign key constraint failed
        return new AppError(ErrorCategory.VALIDATION, 'Foreign key constraint violation', {
          code: 'DB_FK_VIOLATION',
          userMessage: 'This action cannot be completed because it relies on information that does not exist or has been deleted.',
          cause: error,
        });

      default:
        return new AppError(ErrorCategory.DATABASE, `Database error: ${error.code}`, {
          code: error.code,
          cause: error,
        });
    }
  }

  if (error.name === 'PrismaClientValidationError') {
    return new AppError(ErrorCategory.VALIDATION, 'Database validation error', {
      code: 'DB_VALIDATION_ERROR',
      userMessage: 'The provided data is invalid.',
      cause: error,
    });
  }

  if (error.name === 'PrismaClientInitializationError') {
    return new AppError(ErrorCategory.DATABASE, 'Database connection error', {
      code: 'DB_INIT_ERROR',
      severity: ErrorSeverity.CRITICAL,
      retryable: true,
      cause: error,
    });
  }

  // Not a recognizable Prisma error, return undefined to let next handler catch it
  return new AppError(ErrorCategory.SYSTEM, 'Unexpected database error', { cause: error });
}

/**
 * Normalizes an unknown thrown value into an AppError.
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check if it's a Prisma error disguised as a standard Error (sometimes happens if wrapped)
    if (error.name.includes('Prisma')) {
      return handlePrismaError(error);
    }
    
    return new AppError(ErrorCategory.UNKNOWN, error.message, {
      cause: error,
      stack: error.stack,
    });
  }

  return new AppError(ErrorCategory.UNKNOWN, 'An unknown error occurred', {
    cause: error,
  });
}

export type SafeActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; retryable: boolean; requestId?: string } };

/**
 * Wraps a Server Action to ensure it never throws a raw exception to the client.
 */
export async function withErrorHandling<T>(
  action: () => Promise<T>,
  context?: { requestId?: string; userId?: string; tenantId?: string; name?: string }
): Promise<SafeActionResponse<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (rawError) {
    const appError = normalizeError(rawError);
    
    logger.error({
      error: appError,
      ...context
    });

    return {
      success: false,
      error: {
        code: appError.code,
        message: appError.userMessage,
        retryable: appError.retryable,
        requestId: context?.requestId,
      }
    };
  }
}
