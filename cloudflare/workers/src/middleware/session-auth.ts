// Session-based authentication middleware (replaces Clerk)
import { Context, Next } from 'hono';
import { getSession, getSessionIdFromRequest } from '../utils/session';
import type { Env, Variables } from '../types';

/**
 * Require a valid session. Sets userId and userRole on the Hono context.
 * Returns 401 if no valid session is found.
 */
export async function requireAuth(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const sessionId = getSessionIdFromRequest(c.req.raw);

  if (!sessionId) {
    return c.json(
      { success: false, error: { message: 'Not authenticated', code: 'UNAUTHENTICATED' } },
      401
    );
  }

  const session = await getSession(c.env, sessionId);

  if (!session) {
    return c.json(
      { success: false, error: { message: 'Session expired or invalid', code: 'SESSION_EXPIRED' } },
      401
    );
  }

  c.set('userId', session.userId);
  c.set('userRole', session.role);

  return await next();
}
