#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigration() {
  console.log('🚀 Starting database migration...');
  
  try {
    // Database connection configuration
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'blood_pressure_app',
      multipleStatements: true
    };

    console.log(`📡 Connecting to MySQL database: ${config.host}:${config.port}/${config.database}`);
    
    // Create connection
    const connection = await mysql.createConnection(config);
    
    // Test connection
    await connection.ping();
    console.log('✅ Database connection successful');

    // Read and execute schema.sql
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('📋 Executing schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.execute(schemaSql);
      console.log('✅ Schema created successfully');
    } else {
      console.log('⚠️  Schema file not found at database/schema.sql');
    }

    // Read and execute test_data.sql
    const testDataPath = path.join(process.cwd(), 'database', 'test_data.sql');
    if (fs.existsSync(testDataPath)) {
      console.log('📊 Executing test_data.sql...');
      const testDataSql = fs.readFileSync(testDataPath, 'utf8');
      await connection.execute(testDataSql);
      console.log('✅ Test data imported successfully');
    } else {
      console.log('⚠️  Test data file not found at database/test_data.sql');
    }

    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Migration completed successfully! Created ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    await connection.end();
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Please check your database credentials in .env file:');
      console.log('   DB_HOST=localhost');
      console.log('   DB_PORT=3306');
      console.log('   DB_USER=your_username');
      console.log('   DB_PASSWORD=your_password');
      console.log('   DB_NAME=blood_pressure_app');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Please ensure MySQL server is running on your system');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Database does not exist. Please create it first:');
      console.log('   CREATE DATABASE blood_pressure_app;');
    }
    
    process.exit(1);
  }
}

// Run migration
runMigration();