import { type Profile, type InsertProfile, type BloodPressureReading, type InsertBloodPressureReading, type Reminder, type InsertReminder } from "@shared/schema";
import { randomUUID } from "crypto";

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
    for (const profile of this.profiles.values()) {
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

export const storage = new MemStorage();
