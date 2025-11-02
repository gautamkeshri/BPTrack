/**
 * BPTrack API - Cloudflare Workers
 * Medical-grade blood pressure monitoring API running on the edge
 */

import { Hono } from 'hono';
import { cors } from './middleware/cors';
import { logger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import profilesRoute from './routes/profiles';
import readingsRoute from './routes/readings';
import type { Env } from './types';

// Create main Hono app
const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger);
app.use('*', cors);

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    name: 'BPTrack API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Medical-grade blood pressure monitoring API on the edge',
  });
});

// API routes
app.route('/api/profiles', profilesRoute);
app.route('/api/readings', readingsRoute);

// Statistics endpoint (basic implementation)
app.get('/api/statistics', async (c) => {
  const db = drizzle(c.env.DB);
  const days = Number(c.req.query('days')) || 30;

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

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  // Get readings in date range
  const readings = await db
    .select()
    .from(bloodPressureReadings)
    .where(
      and(
        eq(bloodPressureReadings.profileId, activeProfile.id),
        gte(bloodPressureReadings.readingDate, startDate),
        lte(bloodPressureReadings.readingDate, endDate)
      )
    )
    .all();

  if (readings.length === 0) {
    return c.json({
      success: true,
      data: {
        totalReadings: 0,
        averages: {
          systolic: 0,
          diastolic: 0,
          pulse: 0,
          pulseStressure: 0,
          meanArterialPressure: 0,
        },
        ranges: {
          systolic: { min: 0, max: 0 },
          diastolic: { min: 0, max: 0 },
          pulse: { min: 0, max: 0 },
        },
        distribution: {},
        period: { startDate, endDate, days },
      },
    });
  }

  // Calculate statistics
  const totalReadings = readings.length;

  const systolicValues = readings.map((r) => r.systolic);
  const diastolicValues = readings.map((r) => r.diastolic);
  const pulseValues = readings.map((r) => r.pulse);

  const averages = {
    systolic: Math.round(
      systolicValues.reduce((a, b) => a + b, 0) / totalReadings
    ),
    diastolic: Math.round(
      diastolicValues.reduce((a, b) => a + b, 0) / totalReadings
    ),
    pulse: Math.round(pulseValues.reduce((a, b) => a + b, 0) / totalReadings),
    pulseStressure: Math.round(
      readings.reduce((sum, r) => sum + r.pulseStressure, 0) / totalReadings
    ),
    meanArterialPressure: Math.round(
      readings.reduce((sum, r) => sum + r.meanArterialPressure, 0) /
        totalReadings
    ),
  };

  const ranges = {
    systolic: {
      min: Math.min(...systolicValues),
      max: Math.max(...systolicValues),
    },
    diastolic: {
      min: Math.min(...diastolicValues),
      max: Math.max(...diastolicValues),
    },
    pulse: {
      min: Math.min(...pulseValues),
      max: Math.max(...pulseValues),
    },
  };

  // Calculate distribution by classification
  const distribution: Record<string, number> = {};
  readings.forEach((reading) => {
    distribution[reading.classification] =
      (distribution[reading.classification] || 0) + 1;
  });

  return c.json({
    success: true,
    data: {
      totalReadings,
      averages,
      ranges,
      distribution,
      period: { startDate, endDate, days },
    },
  });
});

// Import required for statistics
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, lte } from 'drizzle-orm';
import { profiles, bloodPressureReadings } from './db/schema';

// Error handlers
app.onError(errorHandler);
app.notFound(notFoundHandler);

// Export default handler
export default app;
