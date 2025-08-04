import { type Profile, type InsertProfile, type BloodPressureReading, type InsertBloodPressureReading, type Reminder, type InsertReminder, profiles, bloodPressureReadings, reminders } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { classifyBloodPressure, calculatePulseStressure, calculateMeanArterialPressure } from "../client/src/lib/blood-pressure";

export interface IStorage {
  // Profile methods
  getProfiles(): Promise<Profile[]>;
  getProfile(id: string): Promise<Profile | undefined>;
  getActiveProfile(): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined>;
  setActiveProfile(id: string): Promise<void>;

  // Blood pressure reading methods
  getReadings(profileId: string): Promise<BloodPressureReading[]>;
  getReadingsByDateRange(profileId: string, startDate: Date, endDate: Date): Promise<BloodPressureReading[]>;
  createReading(reading: InsertBloodPressureReading): Promise<BloodPressureReading>;
  deleteReading(id: string): Promise<boolean>;

  // Reminder methods
  getReminders(profileId: string): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | undefined>;
  deleteReminder(id: string): Promise<boolean>;
}

export class MySQLStorage implements IStorage {
  constructor() {
    // Test database connection on initialization
    this.testConnection();
  }

  private async testConnection() {
    try {
      const { testConnection } = await import("./db");
      await testConnection();
    } catch (error) {
      console.error("MySQL connection test failed:", error);
    }
  }

  // Profile methods
  async getProfiles(): Promise<Profile[]> {
    return await db.select().from(profiles);
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, id));
    return result[0];
  }

  async getActiveProfile(): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.isActive, true));
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const newProfile = {
      id,
      ...profile,
      medicalConditions: profile.medicalConditions || [],
      isActive: false,
      createdAt: new Date(),
    };

    await db.insert(profiles).values([newProfile]);
    return newProfile as Profile;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    await db.update(profiles).set(updates).where(eq(profiles.id, id));
    return this.getProfile(id);
  }

  async setActiveProfile(id: string): Promise<void> {
    // First, set all profiles to inactive
    await db.update(profiles).set({ isActive: false });
    // Then set the specified profile as active
    await db.update(profiles).set({ isActive: true }).where(eq(profiles.id, id));
  }

  // Blood pressure reading methods
  async getReadings(profileId: string): Promise<BloodPressureReading[]> {
    return await db
      .select()
      .from(bloodPressureReadings)
      .where(eq(bloodPressureReadings.profileId, profileId))
      .orderBy(desc(bloodPressureReadings.readingDate));
  }

  async getReadingsByDateRange(profileId: string, startDate: Date, endDate: Date): Promise<BloodPressureReading[]> {
    return await db
      .select()
      .from(bloodPressureReadings)
      .where(
        and(
          eq(bloodPressureReadings.profileId, profileId),
          gte(bloodPressureReadings.readingDate, startDate),
          lte(bloodPressureReadings.readingDate, endDate)
        )
      )
      .orderBy(desc(bloodPressureReadings.readingDate));
  }

  async createReading(reading: InsertBloodPressureReading): Promise<BloodPressureReading> {
    const id = randomUUID();
    const classification = classifyBloodPressure(reading.systolic, reading.diastolic);
    const pulseStressure = calculatePulseStressure(reading.systolic, reading.diastolic);
    const meanArterialPressure = calculateMeanArterialPressure(reading.systolic, reading.diastolic);

    const newReading = {
      id,
      profileId: reading.profileId || '', // Ensure profileId is never undefined
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      pulse: reading.pulse,
      readingDate: new Date(reading.readingDate),
      classification: classification.category,
      pulseStressure,
      meanArterialPressure,
      createdAt: new Date(),
    };

    await db.insert(bloodPressureReadings).values([newReading]);
    return newReading as BloodPressureReading;
  }

  async deleteReading(id: string): Promise<boolean> {
    const result = await db.delete(bloodPressureReadings).where(eq(bloodPressureReadings.id, id));
    return (result as any).affectedRows > 0;
  }

  // Reminder methods
  async getReminders(profileId: string): Promise<Reminder[]> {
    return await db
      .select()
      .from(reminders)
      .where(eq(reminders.profileId, profileId))
      .orderBy(reminders.time);
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const id = randomUUID();
    const newReminder = {
      id,
      ...reminder,
      daysOfWeek: reminder.daysOfWeek || [],
      isActive: true,
      createdAt: new Date(),
    };

    await db.insert(reminders).values([newReminder]);
    return newReminder as Reminder;
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | undefined> {
    await db.update(reminders).set(updates).where(eq(reminders.id, id));
    const result = await db.select().from(reminders).where(eq(reminders.id, id));
    return result[0];
  }

  async deleteReminder(id: string): Promise<boolean> {
    const result = await db.delete(reminders).where(eq(reminders.id, id));
    return (result as any).affectedRows > 0;
  }
}

export class MemStorage implements IStorage {
  private profiles: Map<string, Profile> = new Map();
  private readings: Map<string, BloodPressureReading> = new Map();
  private reminders: Map<string, Reminder> = new Map();
  private activeProfileId: string | null = null;

  constructor() {
    // Initialize with sample profiles
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create sample profiles
    const johnProfile = await this.createProfile({
      name: "John Doe",
      gender: "male",
      age: 46,
      medicalConditions: [],
    });

    const dadProfile = await this.createProfile({
      name: "Dad",
      gender: "male", 
      age: 76,
      medicalConditions: ["Diabetic"],
    });

    const momProfile = await this.createProfile({
      name: "Mom",
      gender: "female",
      age: 73,
      medicalConditions: [],
    });

    // Set John as active profile
    await this.setActiveProfile(johnProfile.id);
  }

  // Profile methods
  async getProfiles(): Promise<Profile[]> {
    return Array.from(this.profiles.values());
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getActiveProfile(): Promise<Profile | undefined> {
    if (!this.activeProfileId) return undefined;
    return this.profiles.get(this.activeProfileId);
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = {
      ...insertProfile,
      id,
      medicalConditions: insertProfile.medicalConditions || [],
      isActive: false,
      createdAt: new Date(),
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    const profile = this.profiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates };
    this.profiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async setActiveProfile(id: string): Promise<void> {
    // Set all profiles inactive
    const profilesArray = Array.from(this.profiles.values());
    for (const profile of profilesArray) {
      profile.isActive = false;
    }
    
    // Set the selected profile as active
    const selectedProfile = this.profiles.get(id);
    if (selectedProfile) {
      selectedProfile.isActive = true;
      this.activeProfileId = id;
    }
  }

  // Blood pressure reading methods
  async getReadings(profileId: string): Promise<BloodPressureReading[]> {
    return Array.from(this.readings.values())
      .filter(reading => reading.profileId === profileId)
      .sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
  }

  async getReadingsByDateRange(profileId: string, startDate: Date, endDate: Date): Promise<BloodPressureReading[]> {
    return Array.from(this.readings.values())
      .filter(reading => {
        const readingDate = new Date(reading.readingDate);
        return reading.profileId === profileId && 
               readingDate >= startDate && 
               readingDate <= endDate;
      })
      .sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
  }

  async createReading(insertReading: InsertBloodPressureReading): Promise<BloodPressureReading> {
    const id = randomUUID();
    
    // Calculate derived values
    const pulseStressure = insertReading.systolic - insertReading.diastolic;
    const meanArterialPressure = Math.round(insertReading.diastolic + (pulseStressure / 3));
    
    // Classify blood pressure according to ACC/AHA 2017 guidelines
    const classification = this.classifyBloodPressure(insertReading.systolic, insertReading.diastolic);
    
    const reading: BloodPressureReading = {
      ...insertReading,
      id,
      profileId: insertReading.profileId || '', // Ensure profileId is never undefined
      classification,
      pulseStressure,
      meanArterialPressure,
      createdAt: new Date(),
    };
    
    this.readings.set(id, reading);
    return reading;
  }

  async deleteReading(id: string): Promise<boolean> {
    return this.readings.delete(id);
  }

  private classifyBloodPressure(systolic: number, diastolic: number): string {
    if (systolic >= 180 || diastolic >= 120) {
      return "Hypertensive Crisis";
    } else if (systolic >= 140 || diastolic >= 90) {
      return "Hypertension Stage 2";
    } else if (systolic >= 130 || diastolic >= 80) {
      return "Hypertension Stage 1";
    } else if (systolic >= 120 && diastolic < 80) {
      return "Elevated";
    } else {
      return "Normal";
    }
  }

  // Reminder methods
  async getReminders(profileId: string): Promise<Reminder[]> {
    return Array.from(this.reminders.values())
      .filter(reminder => reminder.profileId === profileId)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = randomUUID();
    const reminder: Reminder = {
      ...insertReminder,
      id,
      isRepeating: insertReminder.isRepeating || false,
      daysOfWeek: insertReminder.daysOfWeek || [],
      isActive: true,
      createdAt: new Date(),
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder = { ...reminder, ...updates };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  async deleteReminder(id: string): Promise<boolean> {
    return this.reminders.delete(id);
  }
}

// Database storage using Replit PostgreSQL
export class DatabaseStorage implements IStorage {
  async getActiveProfile(): Promise<Profile | undefined> {
    const { db } = await import('./db');
    const [activeProfile] = await db.select().from(profiles).where(eq(profiles.isActive, true));
    return activeProfile || undefined;
  }

  async getProfiles(): Promise<Profile[]> {
    const { db } = await import('./db');
    return await db.select().from(profiles);
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    const { db } = await import('./db');
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile || undefined;
  }

  async createProfile(data: InsertProfile): Promise<Profile> {
    const { db } = await import('./db');
    const [profile] = await db
      .insert(profiles)
      .values([data])
      .returning();
    return profile;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    const { db } = await import('./db');
    const [profile] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, id))
      .returning();
    return profile || undefined;
  }

  async setActiveProfile(id: string): Promise<void> {
    const { db } = await import('./db');
    
    // Deactivate all profiles
    await db.update(profiles).set({ isActive: false });
    
    // Activate the selected profile
    await db
      .update(profiles)
      .set({ isActive: true })
      .where(eq(profiles.id, id));
  }

  async getReadings(profileId: string): Promise<BloodPressureReading[]> {
    const { db } = await import('./db');
    return await db
      .select()
      .from(bloodPressureReadings)
      .where(eq(bloodPressureReadings.profileId, profileId))
      .orderBy(desc(bloodPressureReadings.readingDate));
  }

  async getReadingsByDateRange(profileId: string, startDate: Date, endDate: Date): Promise<BloodPressureReading[]> {
    const { db } = await import('./db');
    return await db
      .select()
      .from(bloodPressureReadings)
      .where(
        and(
          eq(bloodPressureReadings.profileId, profileId),
          gte(bloodPressureReadings.readingDate, startDate),
          lte(bloodPressureReadings.readingDate, endDate)
        )
      )
      .orderBy(desc(bloodPressureReadings.readingDate));
  }

  async createReading(data: InsertBloodPressureReading): Promise<BloodPressureReading> {
    const { db } = await import('./db');
    
    // Get active profile if no profileId provided
    const profileId = data.profileId || (await this.getActiveProfile())?.id;
    
    if (!profileId) {
      throw new Error('No active profile found');
    }

    // Calculate derived metrics
    const classification = classifyBloodPressure(data.systolic, data.diastolic);
    const pulseStressure = calculatePulseStressure(data.systolic, data.diastolic);
    const meanArterialPressure = calculateMeanArterialPressure(data.systolic, data.diastolic);

    const readingData = {
      ...data,
      profileId,
      classification: String(classification),
      pulseStressure,
      meanArterialPressure,
    };

    const [reading] = await db
      .insert(bloodPressureReadings)
      .values([readingData])
      .returning();

    return reading;
  }

  async deleteReading(id: string): Promise<boolean> {
    const { db } = await import('./db');
    const result = await db
      .delete(bloodPressureReadings)
      .where(eq(bloodPressureReadings.id, id));
    
    return (result.rowCount || 0) > 0;
  }

  async getReminders(profileId: string): Promise<Reminder[]> {
    const { db } = await import('./db');
    return await db
      .select()
      .from(reminders)
      .where(eq(reminders.profileId, profileId))
      .orderBy(reminders.time);
  }

  async createReminder(data: InsertReminder): Promise<Reminder> {
    const { db } = await import('./db');
    
    const profileId = data.profileId || (await this.getActiveProfile())?.id;
    
    if (!profileId) {
      throw new Error('No active profile found');
    }

    const [reminder] = await db
      .insert(reminders)
      .values([{ ...data, profileId }])
      .returning();

    return reminder;
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | undefined> {
    const { db } = await import('./db');
    const [reminder] = await db
      .update(reminders)
      .set(updates)
      .where(eq(reminders.id, id))
      .returning();
    return reminder || undefined;
  }

  async deleteReminder(id: string): Promise<boolean> {
    const { db } = await import('./db');
    const result = await db
      .delete(reminders)
      .where(eq(reminders.id, id));
    
    return (result.rowCount || 0) > 0;
  }
}

// Initialize storage - use Replit database
async function initializeStorage(): Promise<IStorage> {
  try {
    const { initializeDatabase } = await import('./db');
    const connected = await initializeDatabase();
    
    if (connected) {
      console.log('✅ Using Replit PostgreSQL database');
      return new DatabaseStorage();
    }
  } catch (error) {
    console.warn('Replit database not available, using in-memory storage');
  }
  
  console.log('📦 Using in-memory storage (data will not persist)');
  return new MemStorage();
}

// Initialize storage asynchronously
let storageInstance: IStorage = new MemStorage();

initializeStorage().then(storage => {
  storageInstance = storage;
}).catch(() => {
  storageInstance = new MemStorage();
});

// Export storage with proper proxy to handle async initialization
export const storage = new Proxy({} as IStorage, {
  get(target, prop) {
    const value = (storageInstance as any)[prop];
    return typeof value === 'function' ? value.bind(storageInstance) : value;
  }
});
