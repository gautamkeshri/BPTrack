// Error handling middleware

import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * Global error handler
 */
export function errorHandler(err: Error, c: Context) {
  console.error('Error:', err);

  // Handle Hono HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: {
          message: err.message,
          code: 'HTTP_EXCEPTION',
        },
      },
      err.status
    );
  }

  // Handle validation errors (Zod)
  if (err.name === 'ZodError') {
    return c.json(
      {
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: err,
        },
      },
      400
    );
  }

  // Handle generic errors
  return c.json(
    {
      success: false,
      error: {
        message: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    },
    500
  );
}

/**
 * Not found handler
 */
export function notFoundHandler(c: Context) {
  return c.json(
    {
      success: false,
      error: {
        message: 'Route not found',
        code: 'NOT_FOUND',
      },
    },
    404
  );
}
