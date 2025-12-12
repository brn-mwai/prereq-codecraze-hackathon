// ============================================
// PREREQ - API Utilities
// ============================================

import { NextResponse } from 'next/server';
import { ERROR_CODES } from '@/config/constants';
import type { ApiResponse, ApiError } from '@/types';

/**
 * Creates a successful API response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Creates an error API response
 */
export function errorResponse(
  message: string,
  code: string = ERROR_CODES.INTERNAL_ERROR,
  status: number = 500,
  details?: Record<string, unknown>
): NextResponse<ApiResponse<never>> {
  const error: ApiError = {
    code,
    message,
    ...(details && { details }),
  };

  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  unauthorized: (message: string = 'Unauthorized') =>
    errorResponse(message, ERROR_CODES.UNAUTHORIZED, 401),

  forbidden: (message: string = 'Forbidden') =>
    errorResponse(message, ERROR_CODES.FORBIDDEN, 403),

  notFound: (resource: string = 'Resource') =>
    errorResponse(`${resource} not found`, ERROR_CODES.NOT_FOUND, 404),

  badRequest: (message: string) =>
    errorResponse(message, ERROR_CODES.INVALID_INPUT, 400),

  invalidLinkedInUrl: () =>
    errorResponse(
      'Invalid LinkedIn URL. Please provide a valid profile URL.',
      ERROR_CODES.INVALID_LINKEDIN_URL,
      400
    ),

  usageLimitExceeded: () =>
    errorResponse(
      'Monthly brief limit reached. Please upgrade your plan.',
      ERROR_CODES.USAGE_LIMIT_EXCEEDED,
      429
    ),

  rateLimitExceeded: () =>
    errorResponse(
      'Too many requests. Please try again later.',
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      429
    ),

  internalError: (message: string = 'An unexpected error occurred') =>
    errorResponse(message, ERROR_CODES.INTERNAL_ERROR, 500),
};

/**
 * Wraps an API handler with error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
  return handler().catch((error) => {
    console.error('API Error:', error);

    if (error instanceof Error) {
      // Check for known error types
      if ('code' in error) {
        const code = (error as { code: string }).code;

        switch (code) {
          case ERROR_CODES.UNAUTHORIZED:
            return ApiErrors.unauthorized();
          case ERROR_CODES.NOT_FOUND:
            return ApiErrors.notFound();
          case ERROR_CODES.INVALID_LINKEDIN_URL:
            return ApiErrors.invalidLinkedInUrl();
          case ERROR_CODES.USAGE_LIMIT_EXCEEDED:
            return ApiErrors.usageLimitExceeded();
          case ERROR_CODES.RATE_LIMIT_EXCEEDED:
            return ApiErrors.rateLimitExceeded();
        }
      }

      return ApiErrors.internalError(error.message);
    }

    return ApiErrors.internalError();
  }) as Promise<NextResponse<ApiResponse<T>>>;
}

/**
 * Parses and validates query parameters
 */
export function parseQueryParams<T extends Record<string, unknown>>(
  searchParams: URLSearchParams,
  schema: {
    [K in keyof T]: {
      type: 'string' | 'number' | 'boolean';
      default?: T[K];
      validate?: (value: T[K]) => boolean;
    };
  }
): T {
  const result = {} as T;

  for (const [key, config] of Object.entries(schema)) {
    const rawValue = searchParams.get(key);

    if (rawValue === null) {
      if (config.default !== undefined) {
        (result as Record<string, unknown>)[key] = config.default;
      }
      continue;
    }

    let parsedValue: unknown;

    switch (config.type) {
      case 'number':
        parsedValue = parseInt(rawValue, 10);
        if (isNaN(parsedValue as number)) {
          parsedValue = config.default;
        }
        break;
      case 'boolean':
        parsedValue = rawValue === 'true';
        break;
      default:
        parsedValue = rawValue;
    }

    if (config.validate && !config.validate(parsedValue as T[keyof T])) {
      parsedValue = config.default;
    }

    (result as Record<string, unknown>)[key] = parsedValue;
  }

  return result;
}
