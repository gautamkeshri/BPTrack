import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../shared/schema";

// Database connection configuration
const connectionConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "blood_pressure_app",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
};

// Create connection pool for better performance
const connection = mysql.createPool(connectionConfig);

// Create Drizzle instance
export const db = drizzle(connection, { schema, mode: "default" });

// Database connection test
export async function testConnection() {
  try {
    console.log(`🔄 Testing MySQL connection to ${connectionConfig.host}:${connectionConfig.port}...`);
    console.log(`📋 Connection config: host=${connectionConfig.host}, user=${connectionConfig.user}, database=${connectionConfig.database}`);
    
    const conn = await connection.getConnection();
    await conn.ping();
    conn.release();
    console.log("✅ MySQL database connected successfully");
    return true;
  } catch (error: any) {
    console.error("❌ MySQL database connection failed:", error);
    if (error.code === 'ECONNREFUSED') {
      console.error("   Make sure MySQL server is running on the specified port");
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("   Check username and password credentials");
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error("   Database does not exist - you may need to create it first");
    }
    return false;
  }
}

// Close database connection
export async function closeConnection() {
  try {
    await connection.end();
    console.log("🔌 MySQL database connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
}