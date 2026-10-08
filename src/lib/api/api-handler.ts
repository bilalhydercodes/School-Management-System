import { NextResponse } from 'next/server';
import { normalizeError } from '../errors/error-handler';
import { logger } from '../errors/error-logger';
import { AppError } from '../errors/AppError';

export type ApiHandler = (req: Request, context: any) => Promise<NextResponse> | NextResponse;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId?: string;
  };
}

/**
 * Wraps an API route handler to ensure a consistent JSON response
 * and catch unhandled exceptions.
 */
export function withApiErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req: Request, context: any) => {
    const requestId = `AEH-REQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      // Execute the handler
      const response = await handler(req, context);
      
      // If the response isn't a success code but hasn't thrown, we assume
      // the handler returned a structured Error response itself.
      return response;
    } catch (rawError) {
      // Normalize the error into an AppError (handles Prisma, etc.)
      const error = normalizeError(rawError);

      // Log the error securely
      logger.error({
        error,
        requestId,
        context: `API_ROUTE ${req.method} ${req.url}`
      });

      // Format safe response for client
      const responseBody: ApiResponse = {
        success: false,
        error: {
          code: error.code,
          message: error.userMessage, // Safe message, no raw SQL/Prisma internals
          requestId,
        },
      };

      return NextResponse.json(responseBody, { status: error.statusCode });
    }
  };
}
