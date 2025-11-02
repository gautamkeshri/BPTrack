// Request logging middleware

import { Context, Next } from 'hono';

/**
 * Logger middleware
 */
export async function logger(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  // Log format: METHOD PATH STATUS DURATION
  console.log(`${method} ${path} ${status} ${duration}ms`);
}
