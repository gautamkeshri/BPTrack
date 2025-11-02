// Drizzle ORM Schema for Cloudflare D1 (SQLite)
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Profiles table
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  gender: text('gender').notNull(), // 'male' | 'female'
  age: integer('age').notNull(),
  medicalConditions: text('medical_conditions').notNull().default('[]'), // JSON array as TEXT
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

// Blood pressure readings table
export const bloodPressureReadings = sqliteTable('blood_pressure_readings', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  systolic: integer('systolic').notNull(),
  diastolic: integer('diastolic').notNull(),
  pulse: integer('pulse').notNull(),
  weight: integer('weight'), // Optional, in kg
  notes: text('notes'),
  readingDate: integer('reading_date', { mode: 'timestamp_ms' }).notNull(),
  classification: text('classification').notNull(),
  pulseStressure: integer('pulse_pressure').notNull(),
  meanArterialPressure: integer('mean_arterial_pressure').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

// Reminders table
export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  time: text('time').notNull(), // HH:MM format
  isRepeating: integer('is_repeating', { mode: 'boolean' }).notNull().default(false),
  daysOfWeek: text('days_of_week').notNull().default('[]'), // JSON array as TEXT
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

// Zod schemas for validation
export const insertProfileSchema = createInsertSchema(profiles, {
  medicalConditions: z.string().transform((val) => {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }),
}).pick({
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
  weight: z.number().min(20).max(300).optional(),
  notes: z.string().optional(),
  readingDate: z.coerce.date(),
});

export const insertReminderSchema = createInsertSchema(reminders, {
  daysOfWeek: z.string().transform((val) => {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }),
}).pick({
  profileId: true,
  title: true,
  time: true,
  isRepeating: true,
  daysOfWeek: true,
});

// TypeScript types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type BloodPressureReading = typeof bloodPressureReadings.$inferSelect;
export type InsertBloodPressureReading = z.infer<typeof insertBloodPressureReadingSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
