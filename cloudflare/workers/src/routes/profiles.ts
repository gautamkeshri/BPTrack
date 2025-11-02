// Profiles API routes

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { profiles, insertProfileSchema, type Profile } from '../db/schema';
import { generateUUID } from '../utils/blood-pressure';
import { createSession } from '../utils/session';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/profiles
 * Get all profiles
 */
app.get('/', async (c) => {
  const db = drizzle(c.env.DB);

  const allProfiles = await db.select().from(profiles).all();

  return c.json({
    success: true,
    data: allProfiles,
  });
});

/**
 * GET /api/profiles/active
 * Get the currently active profile
 */
app.get('/active', async (c) => {
  const db = drizzle(c.env.DB);

  const activeProfile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.isActive, true))
    .get();

  if (!activeProfile) {
    return c.json(
      {
        success: false,
        error: {
          message: 'No active profile found',
          code: 'NO_ACTIVE_PROFILE',
        },
      },
      404
    );
  }

  return c.json({
    success: true,
    data: activeProfile,
  });
});

/**
 * GET /api/profiles/:id
 * Get a specific profile by ID
 */
app.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .get();

  if (!profile) {
    return c.json(
      {
        success: false,
        error: {
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND',
        },
      },
      404
    );
  }

  return c.json({
    success: true,
    data: profile,
  });
});

/**
 * POST /api/profiles
 * Create a new profile
 */
app.post('/', async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const body = await c.req.json();
    const validatedData = insertProfileSchema.parse(body);

    const newProfile: Profile = {
      id: generateUUID(),
      name: validatedData.name,
      gender: validatedData.gender,
      age: validatedData.age,
      medicalConditions: JSON.stringify(validatedData.medicalConditions || []),
      isActive: false,
      createdAt: new Date(),
    };

    await db.insert(profiles).values(newProfile).run();

    return c.json(
      {
        success: true,
        data: newProfile,
      },
      201
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json(
        {
          success: false,
          error: {
            message: 'Invalid profile data',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        },
        400
      );
    }

    throw error;
  }
});

/**
 * POST /api/profiles/:id/activate
 * Set a profile as the active profile
 */
app.post('/:id/activate', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  // Check if profile exists
  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .get();

  if (!profile) {
    return c.json(
      {
        success: false,
        error: {
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND',
        },
      },
      404
    );
  }

  // Deactivate all profiles
  await db
    .update(profiles)
    .set({ isActive: false })
    .run();

  // Activate the specified profile
  await db
    .update(profiles)
    .set({ isActive: true })
    .where(eq(profiles.id, id))
    .run();

  // Create a session for this profile
  const sessionId = await createSession(c.env, id);

  return c.json({
    success: true,
    data: {
      message: 'Profile activated successfully',
      profileId: id,
      sessionId,
    },
  });
});

/**
 * PATCH /api/profiles/:id
 * Update a profile
 */
app.patch('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  try {
    const body = await c.req.json();

    // Validate partial update
    const partialSchema = insertProfileSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Check if profile exists
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .get();

    if (!existing) {
      return c.json(
        {
          success: false,
          error: {
            message: 'Profile not found',
            code: 'PROFILE_NOT_FOUND',
          },
        },
        404
      );
    }

    // Update profile
    const updates: any = {};
    if (validatedData.name) updates.name = validatedData.name;
    if (validatedData.gender) updates.gender = validatedData.gender;
    if (validatedData.age) updates.age = validatedData.age;
    if (validatedData.medicalConditions) {
      updates.medicalConditions = JSON.stringify(validatedData.medicalConditions);
    }

    await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, id))
      .run();

    // Fetch updated profile
    const updated = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .get();

    return c.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json(
        {
          success: false,
          error: {
            message: 'Invalid profile data',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        },
        400
      );
    }

    throw error;
  }
});

/**
 * DELETE /api/profiles/:id
 * Delete a profile and all associated data
 */
app.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  // Check if profile exists
  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .get();

  if (!profile) {
    return c.json(
      {
        success: false,
        error: {
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND',
        },
      },
      404
    );
  }

  // Delete profile (CASCADE will delete associated readings and reminders)
  await db.delete(profiles).where(eq(profiles.id, id)).run();

  return c.json({
    success: true,
    data: {
      message: 'Profile deleted successfully',
    },
  });
});

export default app;
