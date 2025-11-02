// Blood Pressure Readings API routes

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import {
  bloodPressureReadings,
  profiles,
  insertBloodPressureReadingSchema,
  type BloodPressureReading,
} from '../db/schema';
import {
  generateUUID,
  classifyBloodPressure,
  calculatePulseStressure,
  calculateMeanArterialPressure,
} from '../utils/blood-pressure';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/readings
 * Get blood pressure readings for active profile or specified profile
 * Query params:
 *   - profileId: Get readings for specific profile
 *   - startDate: Filter by start date (ISO 8601)
 *   - endDate: Filter by end date (ISO 8601)
 */
app.get('/', async (c) => {
  const db = drizzle(c.env.DB);

  // Get profile ID from query or use active profile
  const profileIdParam = c.req.query('profileId');
  let profileId: string;

  if (profileIdParam) {
    // Verify profile exists
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileIdParam))
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

    profileId = profileIdParam;
  } else {
    // Get active profile
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

    profileId = activeProfile.id;
  }

  // Build query with optional date filters
  const startDateParam = c.req.query('startDate');
  const endDateParam = c.req.query('endDate');

  let query = db
    .select()
    .from(bloodPressureReadings)
    .where(eq(bloodPressureReadings.profileId, profileId));

  // Apply date filters if provided
  if (startDateParam && endDateParam) {
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    const readings = await db
      .select()
      .from(bloodPressureReadings)
      .where(
        and(
          eq(bloodPressureReadings.profileId, profileId),
          gte(bloodPressureReadings.readingDate, startDate),
          lte(bloodPressureReadings.readingDate, endDate)
        )
      )
      .orderBy(desc(bloodPressureReadings.readingDate))
      .all();

    return c.json({
      success: true,
      data: readings,
    });
  }

  // Get all readings for profile
  const readings = await query
    .orderBy(desc(bloodPressureReadings.readingDate))
    .all();

  return c.json({
    success: true,
    data: readings,
  });
});

/**
 * POST /api/readings
 * Create a new blood pressure reading for the active profile
 */
app.post('/', async (c) => {
  const db = drizzle(c.env.DB);

  try {
    // Get active profile
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

    const body = await c.req.json();
    const validatedData = insertBloodPressureReadingSchema.parse(body);

    // Calculate derived metrics
    const classification = classifyBloodPressure(
      validatedData.systolic,
      validatedData.diastolic
    );
    const pulseStressure = calculatePulseStressure(
      validatedData.systolic,
      validatedData.diastolic
    );
    const meanArterialPressure = calculateMeanArterialPressure(
      validatedData.systolic,
      validatedData.diastolic
    );

    const newReading: BloodPressureReading = {
      id: generateUUID(),
      profileId: activeProfile.id,
      systolic: validatedData.systolic,
      diastolic: validatedData.diastolic,
      pulse: validatedData.pulse,
      weight: validatedData.weight || null,
      notes: validatedData.notes || null,
      readingDate: validatedData.readingDate,
      classification: classification.category,
      pulseStressure,
      meanArterialPressure,
      createdAt: new Date(),
    };

    await db.insert(bloodPressureReadings).values(newReading).run();

    return c.json(
      {
        success: true,
        data: newReading,
      },
      201
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json(
        {
          success: false,
          error: {
            message: 'Invalid reading data',
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
 * GET /api/readings/:id
 * Get a specific reading by ID
 */
app.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  const reading = await db
    .select()
    .from(bloodPressureReadings)
    .where(eq(bloodPressureReadings.id, id))
    .get();

  if (!reading) {
    return c.json(
      {
        success: false,
        error: {
          message: 'Reading not found',
          code: 'READING_NOT_FOUND',
        },
      },
      404
    );
  }

  return c.json({
    success: true,
    data: reading,
  });
});

/**
 * PUT /api/readings/:id
 * Update a blood pressure reading
 */
app.put('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  try {
    const body = await c.req.json();

    // Validate partial update (no profileId)
    const partialSchema = insertBloodPressureReadingSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Check if reading exists
    const existing = await db
      .select()
      .from(bloodPressureReadings)
      .where(eq(bloodPressureReadings.id, id))
      .get();

    if (!existing) {
      return c.json(
        {
          success: false,
          error: {
            message: 'Reading not found',
            code: 'READING_NOT_FOUND',
          },
        },
        404
      );
    }

    // Prepare updates
    const updates: any = {};
    if (validatedData.systolic) updates.systolic = validatedData.systolic;
    if (validatedData.diastolic) updates.diastolic = validatedData.diastolic;
    if (validatedData.pulse) updates.pulse = validatedData.pulse;
    if (validatedData.weight !== undefined) updates.weight = validatedData.weight;
    if (validatedData.notes !== undefined) updates.notes = validatedData.notes;
    if (validatedData.readingDate) updates.readingDate = validatedData.readingDate;

    // Recalculate derived values if systolic or diastolic changed
    if (validatedData.systolic || validatedData.diastolic) {
      const systolic = validatedData.systolic ?? existing.systolic;
      const diastolic = validatedData.diastolic ?? existing.diastolic;

      const classification = classifyBloodPressure(systolic, diastolic);
      updates.classification = classification.category;
      updates.pulseStressure = calculatePulseStressure(systolic, diastolic);
      updates.meanArterialPressure = calculateMeanArterialPressure(systolic, diastolic);
    }

    // Update reading
    await db
      .update(bloodPressureReadings)
      .set(updates)
      .where(eq(bloodPressureReadings.id, id))
      .run();

    // Fetch updated reading
    const updated = await db
      .select()
      .from(bloodPressureReadings)
      .where(eq(bloodPressureReadings.id, id))
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
            message: 'Invalid reading data',
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
 * DELETE /api/readings/:id
 * Delete a blood pressure reading
 */
app.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  // Check if reading exists
  const reading = await db
    .select()
    .from(bloodPressureReadings)
    .where(eq(bloodPressureReadings.id, id))
    .get();

  if (!reading) {
    return c.json(
      {
        success: false,
        error: {
          message: 'Reading not found',
          code: 'READING_NOT_FOUND',
        },
      },
      404
    );
  }

  // Delete reading
  await db.delete(bloodPressureReadings).where(eq(bloodPressureReadings.id, id)).run();

  return c.json({
    success: true,
    data: {
      message: 'Reading deleted successfully',
    },
  });
});

export default app;
