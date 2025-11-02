// Session management utilities for Workers KV

import type { Env, SessionData } from '../types';

const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Create a new session and store in KV
 */
export async function createSession(
  env: Env,
  profileId: string
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const sessionData: SessionData = {
    activeProfileId: profileId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_EXPIRY,
  };

  // Store in KV with expiration
  await env.SESSIONS.put(
    `session:${sessionId}`,
    JSON.stringify(sessionData),
    {
      expirationTtl: Math.floor(SESSION_EXPIRY / 1000), // Convert to seconds
    }
  );

  return sessionId;
}

/**
 * Get session data from KV
 */
export async function getSession(
  env: Env,
  sessionId: string
): Promise<SessionData | null> {
  const data = await env.SESSIONS.get(`session:${sessionId}`);

  if (!data) {
    return null;
  }

  try {
    const sessionData: SessionData = JSON.parse(data);

    // Check if session is expired
    if (sessionData.expiresAt < Date.now()) {
      await deleteSession(env, sessionId);
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}

/**
 * Update session data
 */
export async function updateSession(
  env: Env,
  sessionId: string,
  updates: Partial<SessionData>
): Promise<boolean> {
  const existing = await getSession(env, sessionId);

  if (!existing) {
    return false;
  }

  const updated: SessionData = {
    ...existing,
    ...updates,
  };

  await env.SESSIONS.put(
    `session:${sessionId}`,
    JSON.stringify(updated),
    {
      expirationTtl: Math.floor((updated.expiresAt - Date.now()) / 1000),
    }
  );

  return true;
}

/**
 * Delete a session from KV
 */
export async function deleteSession(env: Env, sessionId: string): Promise<void> {
  await env.SESSIONS.delete(`session:${sessionId}`);
}

/**
 * Extract session ID from request headers
 */
export function getSessionIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check for session cookie
  const cookies = request.headers.get('Cookie');
  if (cookies) {
    const match = cookies.match(/session=([^;]+)/);
    if (match) {
      return match[1];
    }
  }

  return null;
}
