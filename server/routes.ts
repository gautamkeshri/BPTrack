import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertBloodPressureReadingSchema, insertReminderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Profile routes
  app.get("/api/profiles", async (req, res) => {
    try {
      const profiles = await storage.getProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.get("/api/profiles/active", async (req, res) => {
    try {
      const activeProfile = await storage.getActiveProfile();
      if (!activeProfile) {
        return res.status(404).json({ message: "No active profile found" });
      }
      res.json(activeProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active profile" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const validatedData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.post("/api/profiles/:id/activate", async (req, res) => {
    try {
      await storage.setActiveProfile(req.params.id);
      res.json({ message: "Profile activated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to activate profile" });
    }
  });

  app.patch("/api/profiles/:id", async (req, res) => {
    try {
      const partialSchema = insertProfileSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const updatedProfile = await storage.updateProfile(req.params.id, validatedData);
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.delete("/api/profiles/:id", async (req, res) => {
    try {
      const success = await storage.deleteProfile(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json({ message: "Profile deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete profile" });
    }
  });

  // Blood pressure reading routes
  app.get("/api/readings", async (req, res) => {
    try {
      // Support getting readings for a specific profile via query parameter
      const profileId = req.query.profileId as string;
      let targetProfileId: string;

      if (profileId) {
        // Validate that the profile exists
        const profile = await storage.getProfile(profileId);
        if (!profile) {
          return res.status(404).json({ message: "Profile not found" });
        }
        targetProfileId = profileId;
      } else {
        // Default to active profile
        const activeProfile = await storage.getActiveProfile();
        if (!activeProfile) {
          return res.status(404).json({ message: "No active profile found" });
        }
        targetProfileId = activeProfile.id;
      }

      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      let readings;
      if (startDate && endDate) {
        readings = await storage.getReadingsByDateRange(targetProfileId, startDate, endDate);
      } else {
        readings = await storage.getReadings(targetProfileId);
      }

      res.json(readings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch readings" });
    }
  });

  app.post("/api/readings", async (req, res) => {
    try {
      const activeProfile = await storage.getActiveProfile();
      if (!activeProfile) {
        return res.status(404).json({ message: "No active profile found" });
      }

      const validatedData = insertBloodPressureReadingSchema.parse({
        ...req.body,
        profileId: activeProfile.id,
      });

      const reading = await storage.createReading(validatedData);
      res.status(201).json(reading);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reading data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reading" });
    }
  });

  app.delete("/api/readings/:id", async (req, res) => {
    try {
      const success = await storage.deleteReading(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Reading not found" });
      }
      res.json({ message: "Reading deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reading" });
    }
  });

  // Statistics route
  app.get("/api/statistics", async (req, res) => {
    try {
      const activeProfile = await storage.getActiveProfile();
      if (!activeProfile) {
        return res.status(404).json({ message: "No active profile found" });
      }

      const days = parseInt(req.query.days as string) || 30;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const readings = await storage.getReadingsByDateRange(activeProfile.id, startDate, endDate);
      
      if (readings.length === 0) {
        return res.json({
          totalReadings: 0,
          averages: { systolic: 0, diastolic: 0, pulse: 0, pulseStressure: 0, meanArterialPressure: 0 },
          ranges: { systolic: { min: 0, max: 0 }, diastolic: { min: 0, max: 0 }, pulse: { min: 0, max: 0 } },
          distribution: {},
          period: { startDate, endDate, days },
        });
      }

      // Calculate statistics
      const totalReadings = readings.length;
      const systolicValues = readings.map(r => r.systolic);
      const diastolicValues = readings.map(r => r.diastolic);
      const pulseValues = readings.map(r => r.pulse);

      const averages = {
        systolic: Math.round(systolicValues.reduce((a, b) => a + b, 0) / totalReadings),
        diastolic: Math.round(diastolicValues.reduce((a, b) => a + b, 0) / totalReadings),
        pulse: Math.round(pulseValues.reduce((a, b) => a + b, 0) / totalReadings),
        pulseStressure: Math.round(readings.reduce((sum, r) => sum + r.pulseStressure, 0) / totalReadings),
        meanArterialPressure: Math.round(readings.reduce((sum, r) => sum + r.meanArterialPressure, 0) / totalReadings),
      };

      const ranges = {
        systolic: { min: Math.min(...systolicValues), max: Math.max(...systolicValues) },
        diastolic: { min: Math.min(...diastolicValues), max: Math.max(...diastolicValues) },
        pulse: { min: Math.min(...pulseValues), max: Math.max(...pulseValues) },
      };

      // Calculate distribution
      const distribution = readings.reduce((acc, reading) => {
        acc[reading.classification] = (acc[reading.classification] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        totalReadings,
        averages,
        ranges,
        distribution,
        period: { startDate, endDate, days },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Reminder routes
  app.get("/api/reminders", async (req, res) => {
    try {
      const activeProfile = await storage.getActiveProfile();
      if (!activeProfile) {
        return res.status(404).json({ message: "No active profile found" });
      }

      const reminders = await storage.getReminders(activeProfile.id);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      const activeProfile = await storage.getActiveProfile();
      if (!activeProfile) {
        return res.status(404).json({ message: "No active profile found" });
      }

      const validatedData = insertReminderSchema.parse({
        ...req.body,
        profileId: activeProfile.id,
      });

      const reminder = await storage.createReminder(validatedData);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
