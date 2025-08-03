-- Blood Pressure Monitoring Application - MySQL Database Schema
-- This file contains the core database structure for the application
-- Medical compliance: Follows ACC/AHA 2017 blood pressure guidelines

-- Create database (run this separately if creating new database)
-- CREATE DATABASE blood_pressure_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE blood_pressure_app;

-- ============================================================================
-- PROFILES TABLE
-- Stores user profile information for multi-user support
-- ============================================================================
CREATE TABLE profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    age INT NOT NULL CHECK (age >= 1 AND age <= 150),
    medical_conditions JSON DEFAULT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_profiles_active (is_active),
    INDEX idx_profiles_name (name)
);

-- ============================================================================
-- BLOOD_PRESSURE_READINGS TABLE
-- Stores individual blood pressure measurements with calculated metrics
-- ============================================================================
CREATE TABLE blood_pressure_readings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    profile_id VARCHAR(36) NOT NULL,
    systolic INT NOT NULL CHECK (systolic >= 70 AND systolic <= 250),
    diastolic INT NOT NULL CHECK (diastolic >= 40 AND diastolic <= 150),
    pulse INT NOT NULL CHECK (pulse >= 40 AND pulse <= 200),
    reading_date DATETIME NOT NULL,
    classification VARCHAR(50) NOT NULL,
    pulse_pressure INT GENERATED ALWAYS AS (systolic - diastolic) STORED,
    mean_arterial_pressure INT GENERATED ALWAYS AS (diastolic + ((systolic - diastolic) DIV 3)) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_readings_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_readings_profile_date (profile_id, reading_date DESC),
    INDEX idx_readings_classification (classification),
    INDEX idx_readings_date (reading_date DESC),
    
    -- Ensure systolic > diastolic (basic physiological requirement)
    CONSTRAINT chk_systolic_greater_diastolic CHECK (systolic > diastolic)
);

-- ============================================================================
-- REMINDERS TABLE
-- Stores medication and appointment reminders for users
-- ============================================================================
CREATE TABLE reminders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    profile_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    time TIME NOT NULL,
    is_repeating BOOLEAN DEFAULT FALSE,
    days_of_week JSON DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_reminders_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_reminders_profile_active (profile_id, is_active),
    INDEX idx_reminders_time (time)
);

-- ============================================================================
-- USER AUTHENTICATION TABLE
-- Simple authentication for the application
-- Password: "bloodpressure123" for all users (MD5 hashed for demo purposes)
-- ============================================================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- MD5 hash of "bloodpressure123"
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_active (is_active)
);

-- ============================================================================
-- SESSIONS TABLE
-- Store user sessions for authentication
-- ============================================================================
CREATE TABLE sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    expires BIGINT UNSIGNED NOT NULL,
    data MEDIUMTEXT,
    
    -- Index for cleanup
    INDEX idx_sessions_expires (expires)
);

-- ============================================================================
-- VIEWS FOR REPORTING AND ANALYTICS
-- ============================================================================

-- View for comprehensive reading data with profile information
CREATE VIEW reading_details AS
SELECT 
    r.id,
    r.profile_id,
    p.name as profile_name,
    p.age,
    p.gender,
    r.systolic,
    r.diastolic,
    r.pulse,
    r.reading_date,
    r.classification,
    r.pulse_pressure,
    r.mean_arterial_pressure,
    r.created_at
FROM blood_pressure_readings r
JOIN profiles p ON r.profile_id = p.id;

-- View for active reminders with profile information
CREATE VIEW active_reminders AS
SELECT 
    r.id,
    r.profile_id,
    p.name as profile_name,
    r.title,
    r.time,
    r.is_repeating,
    r.days_of_week,
    r.created_at
FROM reminders r
JOIN profiles p ON r.profile_id = p.id
WHERE r.is_active = TRUE;

-- ============================================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ============================================================================

DELIMITER //

-- Procedure to calculate blood pressure classification
CREATE PROCEDURE CalculateBPClassification(
    IN p_systolic INT,
    IN p_diastolic INT,
    OUT p_classification VARCHAR(50)
)
BEGIN
    IF p_systolic >= 180 OR p_diastolic >= 120 THEN
        SET p_classification = 'Hypertensive Crisis';
    ELSEIF p_systolic >= 140 OR p_diastolic >= 90 THEN
        SET p_classification = 'Hypertension Stage 2';
    ELSEIF p_systolic >= 130 OR p_diastolic >= 80 THEN
        SET p_classification = 'Hypertension Stage 1';
    ELSEIF p_systolic >= 120 AND p_diastolic < 80 THEN
        SET p_classification = 'Elevated';
    ELSE
        SET p_classification = 'Normal';
    END IF;
END //

-- Procedure to get statistics for a profile within date range
CREATE PROCEDURE GetProfileStatistics(
    IN p_profile_id VARCHAR(36),
    IN p_days INT
)
BEGIN
    DECLARE start_date DATETIME DEFAULT DATE_SUB(NOW(), INTERVAL p_days DAY);
    
    SELECT 
        COUNT(*) as total_readings,
        ROUND(AVG(systolic), 1) as avg_systolic,
        ROUND(AVG(diastolic), 1) as avg_diastolic,
        ROUND(AVG(pulse), 1) as avg_pulse,
        ROUND(AVG(pulse_pressure), 1) as avg_pulse_pressure,
        ROUND(AVG(mean_arterial_pressure), 1) as avg_mean_arterial_pressure,
        MIN(systolic) as min_systolic,
        MAX(systolic) as max_systolic,
        MIN(diastolic) as min_diastolic,
        MAX(diastolic) as max_diastolic,
        MIN(pulse) as min_pulse,
        MAX(pulse) as max_pulse
    FROM blood_pressure_readings
    WHERE profile_id = p_profile_id 
        AND reading_date >= start_date;
        
    -- Classification distribution
    SELECT 
        classification,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM blood_pressure_readings WHERE profile_id = p_profile_id AND reading_date >= start_date)), 1) as percentage
    FROM blood_pressure_readings
    WHERE profile_id = p_profile_id 
        AND reading_date >= start_date
    GROUP BY classification
    ORDER BY 
        CASE classification
            WHEN 'Normal' THEN 1
            WHEN 'Elevated' THEN 2
            WHEN 'Hypertension Stage 1' THEN 3
            WHEN 'Hypertension Stage 2' THEN 4
            WHEN 'Hypertensive Crisis' THEN 5
        END;
END //

DELIMITER ;

-- ============================================================================
-- TRIGGERS FOR DATA INTEGRITY AND AUTOMATION
-- ============================================================================

DELIMITER //

-- Trigger to automatically set active profile (only one active at a time)
CREATE TRIGGER tr_profiles_set_active
    BEFORE UPDATE ON profiles
    FOR EACH ROW
BEGIN
    IF NEW.is_active = TRUE AND OLD.is_active = FALSE THEN
        UPDATE profiles SET is_active = FALSE WHERE id != NEW.id;
    END IF;
END //

-- Trigger to ensure only one active profile when inserting
CREATE TRIGGER tr_profiles_insert_active
    BEFORE INSERT ON profiles
    FOR EACH ROW
BEGIN
    IF NEW.is_active = TRUE THEN
        UPDATE profiles SET is_active = FALSE;
    END IF;
END //

DELIMITER ;

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Set MySQL session variables for optimal performance
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
SET time_zone = '+00:00';

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

-- Table Comments
ALTER TABLE profiles COMMENT = 'User profiles for multi-user blood pressure monitoring';
ALTER TABLE blood_pressure_readings COMMENT = 'Individual blood pressure measurements with ACC/AHA 2017 classifications';
ALTER TABLE reminders COMMENT = 'Medication and appointment reminders for users';
ALTER TABLE users COMMENT = 'User authentication table with simple password: bloodpressure123';
ALTER TABLE sessions COMMENT = 'Session storage for user authentication';

-- Column Comments
ALTER TABLE profiles MODIFY medical_conditions JSON COMMENT 'JSON array of medical conditions like ["Diabetes", "Heart Disease"]';
ALTER TABLE blood_pressure_readings MODIFY classification VARCHAR(50) COMMENT 'ACC/AHA 2017 classification: Normal, Elevated, Hypertension Stage 1/2, Hypertensive Crisis';
ALTER TABLE blood_pressure_readings MODIFY pulse_pressure INT COMMENT 'Calculated as systolic - diastolic';
ALTER TABLE blood_pressure_readings MODIFY mean_arterial_pressure INT COMMENT 'Calculated as diastolic + (pulse_pressure / 3)';
ALTER TABLE reminders MODIFY days_of_week JSON COMMENT 'JSON array of days like ["monday", "wednesday", "friday"]';
ALTER TABLE users MODIFY password_hash VARCHAR(255) COMMENT 'MD5 hash of password "bloodpressure123" for all users';

-- ============================================================================
-- GRANTS AND PERMISSIONS (Run as database administrator)
-- ============================================================================

-- Create application user with necessary permissions
-- CREATE USER 'bp_app_user'@'%' IDENTIFIED BY 'bloodpressure123';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON blood_pressure_app.* TO 'bp_app_user'@'%';
-- GRANT EXECUTE ON blood_pressure_app.* TO 'bp_app_user'@'%';
-- FLUSH PRIVILEGES;