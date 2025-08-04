import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('🔄 Connecting to Replit PostgreSQL database...');

// Create PostgreSQL connection pool for better connection management
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
});

// Create drizzle instance with pool
export const db = drizzle(pool, { schema });

// Initialize connection
let isInitialized = false;

export async function initializeDatabase(): Promise<boolean> {
  if (isInitialized) return true;
  
  try {
    // Set up error handling for the pool
    pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err);
    });
    
    // Test the connection
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      console.log('✅ Connected to Replit PostgreSQL database');
      isInitialized = true;
      return true;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('❌ Failed to connect to Replit database:', error.message);
    isInitialized = false;
    return false;
  }
}

// Test connection function with reconnection logic
export async function testConnection(): Promise<boolean> {
  try {
    if (!isInitialized) {
      await initializeDatabase();
    }
    
    // Test the connection using pool
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('❌ Database connection test failed:', error.message);
    
    // Try to reinitialize
    try {
      isInitialized = false;
      await initializeDatabase();
      return true;
    } catch (reconnectError: any) {
      console.error('❌ Failed to reconnect:', reconnectError.message);
      return false;
    }
  }
}

// Close database connection
export async function closeConnection() {
  try {
    if (isInitialized) {
      await pool.end();
      isInitialized = false;
      console.log('🔌 PostgreSQL database connection pool closed');
    }
  } catch (error: any) {
    console.error('Error closing database connection pool:', error.message);
  }
}