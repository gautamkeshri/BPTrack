// Clerk authentication middleware for Cloudflare Workers
import { createClerkClient } from '@clerk/backend';
import { Context, Next } from 'hono';

/**
 * Middleware that requires Clerk authentication
 * Extracts and verifies JWT token from Authorization header
 * Attaches clerkUserId to context for downstream use
 */
export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized - No token provided' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const clerk = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY });
    const verified = await clerk.verifyToken(token);

    // Attach Clerk user ID to context for route handlers
    c.set('clerkUserId', verified.sub);
    c.set('clerkUser', verified);

    await next();
  } catch (error) {
    console.error('Clerk token verification failed:', error);
    return c.json({ success: false, error: 'Unauthorized - Invalid token' }, 401);
  }
}

/**
 * Middleware that optionally checks for Clerk authentication
 * Does not block request if token is missing or invalid
 * Useful for endpoints that support both authenticated and anonymous access
 */
export async function optionalAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const clerk = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY });
      const verified = await clerk.verifyToken(token);
      c.set('clerkUserId', verified.sub);
      c.set('clerkUser', verified);
    } catch {
      // Silent fail for optional auth - proceed without user context
    }
  }

  await next();
}
