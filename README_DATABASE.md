# Database Migration Guide

## Overview

The Blood Pressure Monitoring Application uses MySQL as its production database backend. This guide helps you set up and migrate the database.

## Quick Setup

### Method 1: Using the Migration Script
```bash
node db-setup.js
```

### Method 2: Using the Batch File (Windows)
```cmd
db-migrate.cmd
```

### Method 3: Manual NPM Command
```bash
# Note: db:migrate script needs to be added to package.json manually
npm run db:migrate
```

## Prerequisites

1. **MySQL Server**: Ensure MySQL 8.0+ is installed and running
2. **Database Credentials**: Have your MySQL username and password ready
3. **Environment Variables**: Configure your database connection

## Environment Configuration

Create a `.env` file in the project root with your database settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=blood_pressure_app

# Application Configuration
NODE_ENV=production
PORT=6060
HOST=0.0.0.0
SESSION_SECRET=your-secure-session-secret
```

## Migration Process

The migration script performs these steps:

1. **Connection Test**: Verifies MySQL server connectivity
2. **Database Creation**: Creates `blood_pressure_app` database if needed
3. **Schema Setup**: Executes `database/schema.sql` to create tables
4. **Test Data**: Loads `database/test_data.sql` with sample data
5. **Verification**: Confirms tables and data were created successfully

## Database Schema

The application creates these tables:

- **users**: User authentication and account management
- **sessions**: Express session storage
- **profiles**: Patient/family member profiles
- **blood_pressure_readings**: BP measurements and classifications
- **reminders**: Medication and appointment reminders

## Test Accounts

After migration, you'll have access to these test accounts:

| Username | Password | Full Name |
|----------|----------|-----------|
| johndoe | bloodpressure123 | John Doe |
| janesmith | bloodpressure123 | Jane Smith |
| bobwilson | bloodpressure123 | Bob Wilson |
| alicejohnson | bloodpressure123 | Alice Johnson |
| mikebrown | bloodpressure123 | Mike Brown |

## Troubleshooting

### Common Issues

**1. MySQL Connection Failed**
```
❌ Cannot connect to MySQL server
```
**Solutions:**
- Verify MySQL service is running: `sudo systemctl status mysql`
- Check port 3306 is accessible: `telnet localhost 3306`
- Confirm credentials in `.env` file

**2. Access Denied**
```
❌ ER_ACCESS_DENIED_ERROR
```
**Solutions:**
- Verify username and password in `.env`
- Grant privileges: `GRANT ALL PRIVILEGES ON blood_pressure_app.* TO 'username'@'localhost';`
- Flush privileges: `FLUSH PRIVILEGES;`

**3. Database Already Exists**
```
⚠️ Database 'blood_pressure_app' already exists
```
**Solutions:**
- The script safely handles existing databases
- To reset: `DROP DATABASE blood_pressure_app;` then re-run migration

**4. Permission Issues**
```
❌ Permission denied writing to database
```
**Solutions:**
- Check MySQL user has CREATE, INSERT, UPDATE privileges
- Run as administrator/sudo if needed

### Manual Database Setup

If the migration script fails, you can set up manually:

```sql
-- 1. Create database
CREATE DATABASE blood_pressure_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blood_pressure_app;

-- 2. Execute schema
SOURCE database/schema.sql;

-- 3. Load test data
SOURCE database/test_data.sql;
```

## Production Deployment

For production environments:

1. **Secure Credentials**: Use strong passwords and secure connection strings
2. **SSL/TLS**: Enable encrypted connections
3. **Backup Strategy**: Implement regular database backups
4. **Monitoring**: Set up database performance monitoring
5. **Access Control**: Limit database access to application server only

## Development vs Production

- **Development**: Can use `NODE_ENV=development` for in-memory storage (no database required)
- **Production**: Must use `NODE_ENV=production` with MySQL database

## Support

If you continue to have issues:

1. Check the application logs: `pm2 logs blood-pressure-app`
2. Verify database connectivity: `mysql -u username -p -h localhost`
3. Review migration script output for specific error messages
4. Ensure all prerequisites are met

## Files

- `db-setup.js`: Main migration script
- `db-migrate.cmd`: Windows batch file wrapper
- `database/schema.sql`: Database table definitions
- `database/test_data.sql`: Sample data for testing
- `.env.example`: Environment variable template