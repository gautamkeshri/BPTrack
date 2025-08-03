-- Blood Pressure Monitoring Application - MySQL Database Schema
-- Compatible with MySQL 8.0+

-- Set charset and collation for proper UTF-8 support
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create the database (optional - can be created separately)
-- CREATE DATABASE IF NOT EXISTS blood_pressure_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE blood_pressure_app;

-- ================================================
-- TABLES
-- ================================================

-- Users table for authentication
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table for Express session storage
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
    session_id VARCHAR(128) NOT NULL PRIMARY KEY,
    expires INT UNSIGNED NOT NULL,
    data MEDIUMTEXT,
    
    INDEX idx_expires (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Profiles table for patient/family member profiles
DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 150),
    medical_conditions JSON DEFAULT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blood pressure readings table
DROP TABLE IF EXISTS blood_pressure_readings;
CREATE TABLE blood_pressure_readings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    profile_id VARCHAR(36) NOT NULL,
    systolic INT NOT NULL CHECK (systolic >= 70 AND systolic <= 250),
    diastolic INT NOT NULL CHECK (diastolic >= 40 AND diastolic <= 150),
    pulse INT DEFAULT NULL CHECK (pulse IS NULL OR (pulse >= 30 AND pulse <= 200)),
    pulse_pressure INT GENERATED ALWAYS AS (systolic - diastolic) STORED,
    mean_arterial_pressure DECIMAL(5,1) GENERATED ALWAYS AS (diastolic + (systolic - diastolic) / 3) STORED,
    classification VARCHAR(50) NOT NULL,
    reading_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    INDEX idx_profile_id (profile_id),
    INDEX idx_reading_date (reading_date),
    INDEX idx_classification (classification),
    INDEX idx_profile_date (profile_id, reading_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reminders table for medication and appointment reminders
DROP TABLE IF EXISTS reminders;
CREATE TABLE reminders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    profile_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    time TIME NOT NULL,
    is_repeating BOOLEAN DEFAULT FALSE,
    days_of_week JSON DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    INDEX idx_profile_id (profile_id),
    INDEX idx_time (time),
    INDEX idx_is_active (is_active),
    INDEX idx_profile_active (profile_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TRIGGERS
-- ================================================

-- Trigger to ensure only one active profile per user
DROP TRIGGER IF EXISTS profiles_active_check;
DELIMITER //
CREATE TRIGGER profiles_active_check
    BEFORE UPDATE ON profiles
    FOR EACH ROW
BEGIN
    IF NEW.is_active = TRUE AND OLD.is_active = FALSE THEN
        UPDATE profiles 
        SET is_active = FALSE 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
END //
DELIMITER ;

-- Trigger for new profile activation
DROP TRIGGER IF EXISTS profiles_insert_active;
DELIMITER //
CREATE TRIGGER profiles_insert_active
    BEFORE INSERT ON profiles
    FOR EACH ROW
BEGIN
    IF NEW.is_active = TRUE THEN
        UPDATE profiles 
        SET is_active = FALSE 
        WHERE user_id = NEW.user_id;
    END IF;
END //
DELIMITER ;

-- ================================================
-- STORED PROCEDURES
-- ================================================

-- Procedure to calculate blood pressure classification
DROP PROCEDURE IF EXISTS CalculateBPClassification;
DELIMITER //
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
DELIMITER ;

-- Procedure to get profile statistics
DROP PROCEDURE IF EXISTS GetProfileStatistics;
DELIMITER //
CREATE PROCEDURE GetProfileStatistics(
    IN p_profile_id VARCHAR(36),
    IN p_days INT
)
BEGIN
    DECLARE start_date DATETIME DEFAULT DATE_SUB(NOW(), INTERVAL p_days DAY);
    
    -- Overall statistics
    SELECT 
        COUNT(*) AS total_readings,
        ROUND(AVG(systolic), 1) AS avg_systolic,
        ROUND(AVG(diastolic), 1) AS avg_diastolic,
        ROUND(AVG(pulse), 1) AS avg_pulse,
        ROUND(AVG(pulse_pressure), 1) AS avg_pulse_pressure,
        ROUND(AVG(mean_arterial_pressure), 1) AS avg_mean_arterial_pressure,
        MIN(systolic) AS min_systolic,
        MAX(systolic) AS max_systolic,
        MIN(diastolic) AS min_diastolic,
        MAX(diastolic) AS max_diastolic,
        MIN(pulse) AS min_pulse,
        MAX(pulse) AS max_pulse
    FROM blood_pressure_readings
    WHERE profile_id = p_profile_id AND reading_date >= start_date;
    
    -- Classification distribution
    SELECT 
        classification,
        COUNT(*) AS count,
        ROUND((COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM blood_pressure_readings 
            WHERE profile_id = p_profile_id AND reading_date >= start_date
        )), 1) AS percentage
    FROM blood_pressure_readings
    WHERE profile_id = p_profile_id AND reading_date >= start_date
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

-- ================================================
-- VIEWS
-- ================================================

-- View for reading details with profile information
DROP VIEW IF EXISTS reading_details;
CREATE VIEW reading_details AS
SELECT 
    r.id,
    r.profile_id,
    p.name AS profile_name,
    p.user_id,
    u.username,
    r.systolic,
    r.diastolic,
    r.pulse,
    r.pulse_pressure,
    r.mean_arterial_pressure,
    r.classification,
    r.reading_date,
    r.notes,
    r.created_at
FROM blood_pressure_readings r
JOIN profiles p ON r.profile_id = p.id
JOIN users u ON p.user_id = u.id;

-- View for active reminders with profile information
DROP VIEW IF EXISTS active_reminders;
CREATE VIEW active_reminders AS
SELECT 
    r.id,
    r.profile_id,
    p.name AS profile_name,
    p.user_id,
    u.username,
    r.title,
    r.description,
    r.time,
    r.is_repeating,
    r.days_of_week,
    r.created_at,
    r.updated_at
FROM reminders r
JOIN profiles p ON r.profile_id = p.id
JOIN users u ON p.user_id = u.id
WHERE r.is_active = TRUE;

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_readings_profile_date_class ON blood_pressure_readings(profile_id, reading_date, classification);
CREATE INDEX idx_profiles_user_active ON profiles(user_id, is_active);
CREATE INDEX idx_reminders_profile_time ON reminders(profile_id, time, is_active);

-- ================================================
-- FUNCTIONS (OPTIONAL)
-- ================================================

-- Function to get blood pressure classification
DROP FUNCTION IF EXISTS GetBPClassification;
DELIMITER //
CREATE FUNCTION GetBPClassification(p_systolic INT, p_diastolic INT) 
RETURNS VARCHAR(50)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE classification VARCHAR(50);
    
    IF p_systolic >= 180 OR p_diastolic >= 120 THEN
        SET classification = 'Hypertensive Crisis';
    ELSEIF p_systolic >= 140 OR p_diastolic >= 90 THEN
        SET classification = 'Hypertension Stage 2';
    ELSEIF p_systolic >= 130 OR p_diastolic >= 80 THEN
        SET classification = 'Hypertension Stage 1';
    ELSEIF p_systolic >= 120 AND p_diastolic < 80 THEN
        SET classification = 'Elevated';
    ELSE
        SET classification = 'Normal';
    END IF;
    
    RETURN classification;
END //
DELIMITER ;

-- ================================================
-- INITIAL DATA SETUP
-- ================================================

-- Set default charset for session
SET CHARACTER SET utf8mb4;

-- The schema is now ready for data import
-- Run test_data.sql next to populate with sample data

-- Success message
SELECT 'Blood Pressure Monitoring Database Schema Created Successfully!' AS Status;