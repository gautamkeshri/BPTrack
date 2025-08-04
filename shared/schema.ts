import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  gender: text("gender").notNull(), // 'male' | 'female'
  age: integer("age").notNull(),
  medicalConditions: jsonb("medical_conditions").default([]),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bloodPressureReadings = pgTable("blood_pressure_readings", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id),
  systolic: integer("systolic").notNull(),
  diastolic: integer("diastolic").notNull(),
  pulse: integer("pulse").notNull(),
  readingDate: timestamp("reading_date").notNull(),
  classification: text("classification").notNull(),
  pulseStressure: integer("pulse_pressure").notNull(),
  meanArterialPressure: integer("mean_arterial_pressure").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id),
  title: text("title").notNull(),
  time: text("time").notNull(), // HH:MM format
  isRepeating: boolean("is_repeating").default(false),
  daysOfWeek: jsonb("days_of_week").default([]), // ['monday', 'tuesday', ...]
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  name: true,
  gender: true,
  age: true,
  medicalConditions: true,
});

export const insertBloodPressureReadingSchema = z.object({
  profileId: z.string().optional(),
  systolic: z.number().min(70).max(250),
  diastolic: z.number().min(40).max(150),
  pulse: z.number().min(40).max(200),
  readingDate: z.coerce.date(),
});

export const insertReminderSchema = createInsertSchema(reminders).pick({
  profileId: true,
  title: true,
  time: true,
  isRepeating: true,
  daysOfWeek: true,
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type BloodPressureReading = typeof bloodPressureReadings.$inferSelect;
export type InsertBloodPressureReading = z.infer<typeof insertBloodPressureReadingSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
