import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, int, timestamp, boolean, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = mysqlTable("profiles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  gender: text("gender").notNull(), // 'male' | 'female'
  age: int("age").notNull(),
  medicalConditions: json("medical_conditions").default([]),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bloodPressureReadings = mysqlTable("blood_pressure_readings", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  profileId: varchar("profile_id", { length: 36 }).notNull().references(() => profiles.id),
  systolic: int("systolic").notNull(),
  diastolic: int("diastolic").notNull(),
  pulse: int("pulse").notNull(),
  readingDate: timestamp("reading_date").notNull(),
  classification: text("classification").notNull(),
  pulseStressure: int("pulse_pressure").notNull(),
  meanArterialPressure: int("mean_arterial_pressure").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reminders = mysqlTable("reminders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  profileId: varchar("profile_id", { length: 36 }).notNull().references(() => profiles.id),
  title: text("title").notNull(),
  time: text("time").notNull(), // HH:MM format
  isRepeating: boolean("is_repeating").default(false),
  daysOfWeek: json("days_of_week").default([]), // ['monday', 'tuesday', ...]
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  name: true,
  gender: true,
  age: true,
  medicalConditions: true,
});

export const insertBloodPressureReadingSchema = createInsertSchema(bloodPressureReadings).pick({
  profileId: true,
  systolic: true,
  diastolic: true,
  pulse: true,
  readingDate: true,
}).extend({
  systolic: z.number().min(70).max(250),
  diastolic: z.number().min(40).max(150),
  pulse: z.number().min(40).max(200),
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
