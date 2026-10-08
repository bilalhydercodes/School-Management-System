import { ApiResponse } from './api-handler';

export class ApiClientError extends Error {
  public code: string;
  public requestId?: string;
  public statusCode: number;

  constructor(message: string, code: string, statusCode: number, requestId?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.statusCode = statusCode;
    this.requestId = requestId;
  }
}

export async function apiClient<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch {
      // Failed to parse JSON, meaning the server didn't return our standard ApiResponse
      throw new ApiClientError(
        'An unexpected error occurred while communicating with the server.',
        'JSON_PARSE_ERROR',
        response.status
      );
    }

    if (!response.ok || data.success === false) {
      throw new ApiClientError(
        data.error?.message || 'The request failed.',
        data.error?.code || 'API_ERROR',
        response.status,
        data.error?.requestId
      );
    }

    // Success
    return data.data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network errors, timeouts, CORS, etc.
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiClientError(
        'We could not connect to the server. Please check your network connection.',
        'NETWORK_ERROR',
        0
      );
    }

    // Catch-all
    throw new ApiClientError(
      'An unexpected error occurred. Please try again.',
      'UNKNOWN_CLIENT_ERROR',
      0
    );
  }
}
