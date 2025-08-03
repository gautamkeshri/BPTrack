#!/usr/bin/env node

/**
 * Blood Pressure App - Database Setup Script
 * Standalone migration tool for MySQL database
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

function log(level, message) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🔍'
  }[level] || 'ℹ️';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function checkMySQLConnection(config) {
  try {
    const connection = await mysql.createConnection({
      ...config,
      database: undefined // Don't specify database for initial connection test
    });
    await connection.ping();
    await connection.end();
    return true;
  } catch (error) {
    return false;
  }
}

async function createDatabaseIfNotExists(config) {
  try {
    const connection = await mysql.createConnection({
      ...config,
      database: undefined
    });
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    log('success', `Database '${config.database}' is ready`);
    await connection.end();
    
  } catch (error) {
    log('error', `Failed to create database: ${error.message}`);
    throw error;
  }
}

async function runMigration() {
  log('info', 'Starting Blood Pressure App database migration');
  
  try {
    // Database connection configuration
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'blood_pressure_app',
      multipleStatements: true,
      charset: 'utf8mb4'
    };

    log('info', `Connecting to MySQL: ${config.user}@${config.host}:${config.port}`);
    
    // Test MySQL connection
    const canConnect = await checkMySQLConnection(config);
    if (!canConnect) {
      throw new Error('Cannot connect to MySQL server. Please check if MySQL is running and credentials are correct.');
    }
    
    log('success', 'MySQL connection successful');

    // Create database if it doesn't exist
    await createDatabaseIfNotExists(config);

    // Connect to the specific database
    const connection = await mysql.createConnection(config);
    
    // Read and execute schema.sql
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      log('info', 'Executing database schema...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Split and execute statements individually to handle large files
      const statements = schemaSql
        .split(';')
        .filter(stmt => stmt.trim().length > 0)
        .filter(stmt => !stmt.trim().startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.execute(statement);
        }
      }
      
      log('success', `Schema executed successfully (${statements.length} statements)`);
    } else {
      log('warning', 'Schema file not found at database/schema.sql');
    }

    // Read and execute test_data.sql
    const testDataPath = path.join(process.cwd(), 'database', 'test_data.sql');
    if (fs.existsSync(testDataPath)) {
      log('info', 'Loading test data...');
      const testDataSql = fs.readFileSync(testDataPath, 'utf8');
      
      // Split and execute statements
      const statements = testDataSql
        .split(';')
        .filter(stmt => stmt.trim().length > 0)
        .filter(stmt => !stmt.trim().startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await connection.execute(statement);
          } catch (error) {
            // Ignore duplicate entry errors for test data
            if (!error.message.includes('Duplicate entry')) {
              throw error;
            }
          }
        }
      }
      
      log('success', `Test data loaded successfully (${statements.length} statements)`);
    } else {
      log('warning', 'Test data file not found at database/test_data.sql');
    }

    // Verify tables and data
    const [tables] = await connection.execute('SHOW TABLES');
    log('success', `Migration completed! Database contains ${tables.length} tables:`);
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      const count = rows[0].count;
      log('info', `  • ${tableName}: ${count} records`);
    }

    // Show test account information
    try {
      const [users] = await connection.execute('SELECT username FROM users LIMIT 5');
      if (users.length > 0) {
        log('success', 'Test accounts available:');
        users.forEach(user => {
          log('info', `  • Username: ${user.username}, Password: bloodpressure123`);
        });
      }
    } catch (error) {
      // Ignore if users table doesn't exist or has no data
    }

    await connection.end();
    log('success', 'Database migration completed successfully!');
    
    return true;
    
  } catch (error) {
    log('error', `Migration failed: ${error.message}`);
    
    // Provide helpful error messages
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      log('warning', 'Database access denied. Please check your credentials:');
      log('info', '  • DB_USER=your_mysql_username');
      log('info', '  • DB_PASSWORD=your_mysql_password');
    } else if (error.code === 'ECONNREFUSED') {
      log('warning', 'Cannot connect to MySQL. Please ensure:');
      log('info', '  • MySQL server is running');
      log('info', '  • Port 3306 is accessible');
      log('info', '  • Firewall allows connections');
    } else if (error.message.includes('Cannot connect')) {
      log('warning', 'Connection issues. Please verify:');
      log('info', '  • MySQL service is started');
      log('info', '  • Host and port are correct');
      log('info', '  • Network connectivity');
    }
    
    return false;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log('error', `Unexpected error: ${error.message}`);
      process.exit(1);
    });
}

export default runMigration;