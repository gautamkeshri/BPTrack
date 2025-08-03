# Database Configuration - MySQL

This directory contains the MySQL database schema and test data for the Blood Pressure Monitoring Application.

## Files

### 1. schema.sql
Contains the complete database structure including:
- **Core Tables**: profiles, blood_pressure_readings, reminders, users, sessions
- **Views**: reading_details, active_reminders
- **Stored Procedures**: CalculateBPClassification, GetProfileStatistics
- **Triggers**: Automatic profile activation management
- **Indexes**: Performance optimization for common queries

### 2. test_data.sql
Contains comprehensive test data including:
- **5 Test Users** with simple common password
- **7 User Profiles** covering various demographics and conditions
- **90+ Blood Pressure Readings** across all classification ranges
- **20+ Reminders** for medication and appointment management

## Default Login Credentials

All test users have the same password for simplicity: **bloodpressure123**

### Test User Accounts:

| Username | Email | Full Name | Profile Description |
|----------|-------|-----------|-------------------|
| johndoe | john.doe@email.com | John Doe | 46M, Normal BP range |
| janesmith | jane.smith@email.com | Jane Smith | 38F, Diabetes + Hypertension |
| bobwilson | bob.wilson@email.com | Bob Wilson | 62M, Heart Disease |
| alicejohnson | alice.johnson@email.com | Alice Johnson | 54F, Diabetes |
| mikebrown | mike.brown@email.com | Mike Brown | 28M, Healthy |

## Database Setup Instructions

### 1. Create Database
```sql
CREATE DATABASE blood_pressure_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blood_pressure_app;
```

### 2. Run Schema
```bash
mysql -u root -p blood_pressure_app < database/schema.sql
```

### 3. Load Test Data
```bash
mysql -u root -p blood_pressure_app < database/test_data.sql
```

### 4. Create Application User (Optional)
```sql
CREATE USER 'bp_app_user'@'%' IDENTIFIED BY 'bloodpressure123';
GRANT SELECT, INSERT, UPDATE, DELETE ON blood_pressure_app.* TO 'bp_app_user'@'%';
GRANT EXECUTE ON blood_pressure_app.* TO 'bp_app_user'@'%';
FLUSH PRIVILEGES;
```

## Environment Variables

Configure these environment variables for MySQL connection:

```bash
# MySQL Database Configuration
DATABASE_URL="mysql://username:password@host:port/blood_pressure_app"
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="your_password"
DB_NAME="blood_pressure_app"
NODE_ENV="production"  # Use MySQL storage in production
```

## Medical Compliance

The database structure follows ACC/AHA 2017 blood pressure guidelines:

- **Blood Pressure Classifications**: Normal, Elevated, Hypertension Stage 1/2, Hypertensive Crisis
- **Calculated Metrics**: Pulse Pressure and Mean Arterial Pressure
- **Validation**: Physiologically reasonable ranges (systolic 70-250, diastolic 40-150)
- **Data Integrity**: Foreign key constraints and check constraints

## Performance Features

### Optimized Indexes
- Profile and reading queries by date
- Classification distribution analysis
- Active reminder lookups

### Stored Procedures
- Automatic blood pressure classification
- Statistical calculations for reporting
- Date range analysis

### Views
- Comprehensive reading details with profile information
- Active reminders with user context

## Data Migration

If migrating from PostgreSQL:
1. Export existing data using pg_dump
2. Convert data types (JSON arrays, UUIDs, timestamps)
3. Import converted data into MySQL tables
4. Verify data integrity and relationships

## Backup and Maintenance

### Regular Backups
```bash
# Full database backup
mysqldump -u root -p blood_pressure_app > backup_$(date +%Y%m%d).sql

# Schema only backup
mysqldump -u root -p --no-data blood_pressure_app > schema_backup.sql
```

### Data Cleanup
```sql
-- Remove old readings (older than 2 years)
DELETE FROM blood_pressure_readings 
WHERE reading_date < DATE_SUB(NOW(), INTERVAL 2 YEAR);

-- Clean up inactive profiles with no readings
DELETE p FROM profiles p 
LEFT JOIN blood_pressure_readings r ON p.id = r.profile_id 
WHERE p.is_active = FALSE AND r.id IS NULL;
```

## Security Considerations

1. **Password Hashing**: Test data uses MD5 for simplicity, use bcrypt in production
2. **SSL Connections**: Enable SSL for production database connections
3. **User Privileges**: Use dedicated application user with minimal required permissions
4. **Data Encryption**: Consider encrypting sensitive medical data at rest
5. **Access Logging**: Enable MySQL query logging for audit trails

## Development vs Production

### Development Mode
- Uses in-memory storage for fast testing
- No database connection required
- Pre-populated sample data

### Production Mode
- Requires MySQL database connection
- Persistent data storage
- Full authentication and session management

The application automatically selects storage type based on `NODE_ENV` and `DATABASE_URL` environment variables.