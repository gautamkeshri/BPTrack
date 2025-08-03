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
    const conn = await connection.getConnection();
    await conn.ping();
    conn.release();
    console.log("✅ MySQL database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MySQL database connection failed:", error);
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