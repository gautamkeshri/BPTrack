// Access request routes — patient looks up a doctor and sends an access request
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { users, accessGrants } from '../db/schema';
import { requireAuth } from '../middleware/session-auth';
import type { Env, Variables } from '../types';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('*', requireAuth);

// ---------------------------------------------------------------------------
// GET /api/access-requests/lookup?code=DR-XXXXXX
// Patient looks up a doctor by their public doctor code
// ---------------------------------------------------------------------------
app.get('/lookup', async (c) => {
  const code = c.req.query('code')?.trim().toUpperCase();
  if (!code) {
    return c.json({ success: false, error: { message: 'code query param is required', code: 'BAD_REQUEST' } }, 400);
  }

  const db = drizzle(c.env.DB);
  const doctor = await db
    .select({ id: users.id, name: users.name, doctorId: users.doctorId })
    .from(users)
    .where(and(eq(users.doctorId, code), eq(users.role, 'doctor')))
    .get();

  if (!doctor) {
    return c.json({ success: false, error: { message: 'No doctor found with that ID', code: 'NOT_FOUND' } }, 404);
  }

  return c.json({ success: true, data: doctor });
});

// ---------------------------------------------------------------------------
// GET /api/access-requests
// List the current patient's access grants (with doctor name + code)
// ---------------------------------------------------------------------------
app.get('/', async (c) => {
  const patientId = c.get('userId');
  const db = drizzle(c.env.DB);

  const grants = await db
    .select({
      id: accessGrants.id,
      status: accessGrants.status,
      createdAt: accessGrants.createdAt,
      updatedAt: accessGrants.updatedAt,
      doctorUserId: accessGrants.doctorId,
      doctorName: users.name,
      doctorCode: users.doctorId,
    })
    .from(accessGrants)
    .innerJoin(users, eq(accessGrants.doctorId, users.id))
    .where(eq(accessGrants.patientId, patientId))
    .all();

  return c.json({ success: true, data: grants });
});

// ---------------------------------------------------------------------------
// POST /api/access-requests
// Patient sends an access request to a doctor identified by doctorCode
// ---------------------------------------------------------------------------
app.post('/', async (c) => {
  const patientId = c.get('userId');
  const userRole = c.get('userRole');

  if (userRole !== 'patient') {
    return c.json({ success: false, error: { message: 'Only patients can send access requests', code: 'FORBIDDEN' } }, 403);
  }

  let body: { doctorCode?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: { message: 'Invalid request body', code: 'BAD_REQUEST' } }, 400);
  }

  const code = body.doctorCode?.trim().toUpperCase();
  if (!code) {
    return c.json({ success: false, error: { message: 'doctorCode is required', code: 'MISSING_FIELDS' } }, 400);
  }

  const db = drizzle(c.env.DB);

  const doctor = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(and(eq(users.doctorId, code), eq(users.role, 'doctor')))
    .get();

  if (!doctor) {
    return c.json({ success: false, error: { message: 'No doctor found with that ID', code: 'NOT_FOUND' } }, 404);
  }

  // Check for existing grant
  const existing = await db
    .select({ id: accessGrants.id, status: accessGrants.status })
    .from(accessGrants)
    .where(and(eq(accessGrants.patientId, patientId), eq(accessGrants.doctorId, doctor.id)))
    .get();

  if (existing) {
    if (existing.status === 'pending') {
      return c.json({ success: false, error: { message: 'Access request already pending', code: 'ALREADY_PENDING' } }, 409);
    }
    if (existing.status === 'approved') {
      return c.json({ success: false, error: { message: 'This doctor already has access', code: 'ALREADY_GRANTED' } }, 409);
    }
    // Revoked → allow re-requesting
    const now = new Date();
    await db
      .update(accessGrants)
      .set({ status: 'pending', updatedAt: now })
      .where(eq(accessGrants.id, existing.id))
      .run();
    return c.json({ success: true, data: { message: 'Access request re-sent', doctorName: doctor.name } });
  }

  // Create new grant
  const now = new Date();
  await db.insert(accessGrants).values({
    id: crypto.randomUUID(),
    patientId,
    doctorId: doctor.id,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }).run();

  return c.json({ success: true, data: { message: 'Access request sent', doctorName: doctor.name } }, 201);
});

// ---------------------------------------------------------------------------
// GET /api/access-requests/incoming
// Doctor sees all access grants where they are the doctor (with patient info)
// ---------------------------------------------------------------------------
app.get('/incoming', async (c) => {
  const doctorId = c.get('userId');
  const userRole = c.get('userRole');

  if (userRole !== 'doctor') {
    return c.json({ success: false, error: { message: 'Only doctors can view incoming requests', code: 'FORBIDDEN' } }, 403);
  }

  const db = drizzle(c.env.DB);

  const grants = await db
    .select({
      id: accessGrants.id,
      status: accessGrants.status,
      createdAt: accessGrants.createdAt,
      updatedAt: accessGrants.updatedAt,
      patientId: accessGrants.patientId,
      patientName: users.name,
      patientEmail: users.email,
    })
    .from(accessGrants)
    .innerJoin(users, eq(accessGrants.patientId, users.id))
    .where(eq(accessGrants.doctorId, doctorId))
    .all();

  return c.json({ success: true, data: grants });
});

// ---------------------------------------------------------------------------
// PATCH /api/access-requests/:id
// Doctor approves or revokes a grant
// ---------------------------------------------------------------------------
app.patch('/:id', async (c) => {
  const doctorId = c.get('userId');
  const userRole = c.get('userRole');
  const grantId = c.req.param('id');

  if (userRole !== 'doctor') {
    return c.json({ success: false, error: { message: 'Only doctors can update access requests', code: 'FORBIDDEN' } }, 403);
  }

  let body: { status?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: { message: 'Invalid request body', code: 'BAD_REQUEST' } }, 400);
  }

  const status = body.status;
  if (status !== 'approved' && status !== 'revoked') {
    return c.json({ success: false, error: { message: 'status must be "approved" or "revoked"', code: 'BAD_REQUEST' } }, 400);
  }

  const db = drizzle(c.env.DB);

  // Ensure the grant belongs to this doctor
  const grant = await db
    .select({ id: accessGrants.id, doctorId: accessGrants.doctorId })
    .from(accessGrants)
    .where(eq(accessGrants.id, grantId))
    .get();

  if (!grant) {
    return c.json({ success: false, error: { message: 'Grant not found', code: 'NOT_FOUND' } }, 404);
  }
  if (grant.doctorId !== doctorId) {
    return c.json({ success: false, error: { message: 'Forbidden', code: 'FORBIDDEN' } }, 403);
  }

  await db
    .update(accessGrants)
    .set({ status, updatedAt: new Date() })
    .where(eq(accessGrants.id, grantId))
    .run();

  return c.json({ success: true, data: { message: `Grant ${status}` } });
});

export default app;
