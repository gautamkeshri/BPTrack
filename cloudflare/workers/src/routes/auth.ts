// Auth API routes — email+password login/logout/me
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { createAuthSession, deleteSession, getSession, getSessionIdFromRequest } from '../utils/session';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
app.post('/login', async (c) => {
  let body: { email?: string; password?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: { message: 'Invalid request body', code: 'BAD_REQUEST' } }, 400);
  }

  const { email, password } = body;

  if (!email || !password) {
    return c.json({ success: false, error: { message: 'Email and password are required', code: 'MISSING_FIELDS' } }, 400);
  }

  const db = drizzle(c.env.DB);
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .get();

  if (!user) {
    return c.json({ success: false, error: { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' } }, 401);
  }

  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return c.json({ success: false, error: { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' } }, 401);
  }

  const token = await createAuthSession(c.env, user.id, user.role);

  return c.json({
    success: true,
    data: {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    },
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
app.post('/logout', async (c) => {
  const sessionId = getSessionIdFromRequest(c.req.raw);
  if (sessionId) {
    await deleteSession(c.env, sessionId);
  }
  return c.json({ success: true, data: { message: 'Logged out successfully' } });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
app.get('/me', async (c) => {
  const sessionId = getSessionIdFromRequest(c.req.raw);
  if (!sessionId) {
    return c.json({ success: false, error: { message: 'Not authenticated', code: 'UNAUTHENTICATED' } }, 401);
  }

  const session = await getSession(c.env, sessionId);
  if (!session) {
    return c.json({ success: false, error: { message: 'Session expired', code: 'SESSION_EXPIRED' } }, 401);
  }

  const db = drizzle(c.env.DB);
  const user = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!user) {
    return c.json({ success: false, error: { message: 'User not found', code: 'USER_NOT_FOUND' } }, 404);
  }

  return c.json({ success: true, data: user });
});

// ---------------------------------------------------------------------------
// POST /api/auth/register  (for creating new users — useful for seeding/demo)
// ---------------------------------------------------------------------------
app.post('/register', async (c) => {
  let body: { email?: string; password?: string; name?: string; role?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: { message: 'Invalid request body', code: 'BAD_REQUEST' } }, 400);
  }

  const { email, password, name, role = 'patient' } = body;

  if (!email || !password || !name) {
    return c.json({ success: false, error: { message: 'Email, password, and name are required', code: 'MISSING_FIELDS' } }, 400);
  }

  if (!['patient', 'doctor'].includes(role)) {
    return c.json({ success: false, error: { message: 'Role must be patient or doctor', code: 'INVALID_ROLE' } }, 400);
  }

  const db = drizzle(c.env.DB);

  // Check email is unique
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .get();

  if (existing) {
    return c.json({ success: false, error: { message: 'Email already in use', code: 'EMAIL_TAKEN' } }, 409);
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const id = crypto.randomUUID();

  await db.insert(users).values({
    id,
    email: email.toLowerCase().trim(),
    passwordHash,
    salt,
    role,
    name,
    createdAt: new Date(),
  }).run();

  const token = await createAuthSession(c.env, id, role);

  return c.json({
    success: true,
    data: {
      token,
      user: { id, email: email.toLowerCase().trim(), name, role },
    },
  }, 201);
});

export default app;
