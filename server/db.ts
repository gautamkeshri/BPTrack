import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('🔄 Connecting to Replit PostgreSQL database...');

// Create PostgreSQL client
export const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Initialize connection
let isConnected = false;

export async function initializeDatabase(): Promise<boolean> {
  if (isConnected) return true;
  
  try {
    await client.connect();
    await client.query('SELECT 1');
    console.log('✅ Connected to Replit PostgreSQL database');
    isConnected = true;
    return true;
  } catch (error: any) {
    console.error('❌ Failed to connect to Replit database:', error.message);
    return false;
  }
}

// Test connection function
export async function testConnection(): Promise<boolean> {
  try {
    if (!isConnected) {
      await initializeDatabase();
    }
    await client.query('SELECT 1');
    return true;
  } catch (error: any) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

// Close database connection
export async function closeConnection() {
  try {
    if (isConnected) {
      await client.end();
      isConnected = false;
      console.log('🔌 PostgreSQL database connection closed');
    }
  } catch (error: any) {
    console.error('Error closing database connection:', error.message);
  }
}