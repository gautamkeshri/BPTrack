-- Blood Pressure Monitoring Application - MySQL Test Data
-- This file contains sample data for development and testing
-- 
-- DEFAULT LOGIN CREDENTIALS FOR ALL USERS:
-- Username: See individual users below
-- Password: bloodpressure123 (same for all users for simplicity)
-- Password Hash (MD5): 482c811da5d5b4bc6d497ffa98491e38
--
-- Test Users:
-- - johndoe / john.doe@email.com
-- - janesmith / jane.smith@email.com  
-- - bobwilson / bob.wilson@email.com
-- - alicejohnson / alice.johnson@email.com
-- - mikebrown / mike.brown@email.com

USE blood_pressure_app;

-- ============================================================================
-- CLEAR EXISTING DATA (use DELETE instead of TRUNCATE for foreign key constraints)
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 0;

-- Delete in reverse order of dependencies
DELETE FROM blood_pressure_readings;
DELETE FROM reminders;
DELETE FROM profiles;
DELETE FROM users;
DELETE FROM sessions;

-- Reset auto-increment counters (if any)
-- ALTER TABLE users AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- TEST USERS DATA
-- Password for all users: "bloodpressure123" (MD5: 482c811da5d5b4bc6d497ffa98491e38)
-- Note: In production, use bcrypt or other secure hashing
-- ============================================================================
INSERT INTO users (id, username, email, password_hash, full_name, created_at) VALUES
-- John Doe - Primary test user, password: bloodpressure123
('550e8400-e29b-41d4-a716-446655440000', 'johndoe', 'john.doe@email.com', '482c811da5d5b4bc6d497ffa98491e38', 'John Doe', '2024-01-01 10:00:00'),

-- Jane Smith - Secondary test user, password: bloodpressure123  
('550e8400-e29b-41d4-a716-446655440001', 'janesmith', 'jane.smith@email.com', '482c811da5d5b4bc6d497ffa98491e38', 'Jane Smith', '2024-01-02 14:30:00'),

-- Bob Wilson - Test user with hypertension, password: bloodpressure123
('550e8400-e29b-41d4-a716-446655440002', 'bobwilson', 'bob.wilson@email.com', '482c811da5d5b4bc6d497ffa98491e38', 'Bob Wilson', '2024-01-03 09:15:00'),

-- Alice Johnson - Test user with diabetes, password: bloodpressure123
('550e8400-e29b-41d4-a716-446655440003', 'alicejohnson', 'alice.johnson@email.com', '482c811da5d5b4bc6d497ffa98491e38', 'Alice Johnson', '2024-01-04 16:45:00'),

-- Mike Brown - Young adult test user, password: bloodpressure123
('550e8400-e29b-41d4-a716-446655440004', 'mikebrown', 'mike.brown@email.com', '482c811da5d5b4bc6d497ffa98491e38', 'Mike Brown', '2024-01-05 11:20:00');

-- ============================================================================
-- TEST PROFILES DATA
-- Multiple family profiles for comprehensive testing
-- ============================================================================
INSERT INTO profiles (id, user_id, name, gender, age, medical_conditions, is_active, created_at) VALUES
-- John Doe - 46-year-old male with normal BP
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'John Doe', 'male', 46, '[]', TRUE, '2024-01-01 10:00:00'),

-- Jane Smith - 38-year-old female with diabetes and hypertension
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Jane Smith', 'female', 38, '["Diabetes", "Hypertension"]', FALSE, '2024-01-02 14:30:00'),

-- Bob Wilson - 62-year-old male with heart disease
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Bob Wilson', 'male', 62, '["Heart Disease", "High Cholesterol"]', FALSE, '2024-01-03 09:15:00'),

-- Alice Johnson - 54-year-old female with diabetes
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Alice Johnson', 'female', 54, '["Diabetes"]', FALSE, '2024-01-04 16:45:00'),

-- Mike Brown - 28-year-old male, healthy
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Mike Brown', 'male', 28, '[]', FALSE, '2024-01-05 11:20:00'),

-- Sarah Doe - 16-year-old female, John's daughter
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Sarah Doe', 'female', 16, '[]', FALSE, '2024-01-06 13:10:00'),

-- Robert Doe - 72-year-old male, John's father
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Robert Doe', 'male', 72, '["Hypertension", "Diabetes", "Arthritis"]', FALSE, '2024-01-07 15:45:00');

-- ============================================================================
-- TEST BLOOD PRESSURE READINGS DATA
-- Comprehensive readings covering all ACC/AHA 2017 classifications
-- ============================================================================

-- John Doe's readings (Normal to Elevated range)
INSERT INTO blood_pressure_readings (id, profile_id, systolic, diastolic, pulse, classification, reading_date, notes) VALUES
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 118, 78, 72, 'Normal', '2024-01-15 08:30:00', 'Morning reading after workout'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 122, 79, 68, 'Elevated', '2024-01-14 19:45:00', 'Evening reading'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 115, 75, 70, 'Normal', '2024-01-13 12:00:00', 'After lunch'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440000', 125, 77, 74, 'Elevated', '2024-01-12 07:15:00', 'Morning reading'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440000', 119, 79, 69, 'Normal', '2024-01-11 20:30:00', 'Before bed'),

-- Jane Smith's readings (Hypertension Stage 1)
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 135, 85, 78, 'Hypertension Stage 1', '2024-01-15 09:00:00', 'With medication'),
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 138, 88, 82, 'Hypertension Stage 1', '2024-01-14 08:30:00', 'Morning reading'),
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', 132, 82, 76, 'Hypertension Stage 1', '2024-01-13 18:00:00', 'After work stress'),
('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440001', 134, 86, 80, 'Hypertension Stage 1', '2024-01-12 12:30:00', 'Lunch break'),
('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440001', 136, 84, 79, 'Hypertension Stage 1', '2024-01-11 21:00:00', 'Evening reading'),

-- Bob Wilson's readings (Hypertension Stage 2)
('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 148, 95, 85, 'Hypertension Stage 2', '2024-01-15 07:30:00', 'Morning medication taken'),
('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 152, 98, 88, 'Hypertension Stage 2', '2024-01-14 19:00:00', 'High stress day'),
('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', 145, 92, 83, 'Hypertension Stage 2', '2024-01-13 11:45:00', 'After appointment'),
('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440002', 150, 94, 86, 'Hypertension Stage 2', '2024-01-12 16:20:00', 'Afternoon reading'),
('770e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440002', 147, 96, 84, 'Hypertension Stage 2', '2024-01-11 08:00:00', 'Morning reading'),

-- Alice Johnson's readings (Improving trend)
('770e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440003', 142, 90, 75, 'Hypertension Stage 2', '2024-01-15 10:15:00', 'Medication adjustment'),
('770e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440003', 138, 87, 73, 'Hypertension Stage 1', '2024-01-14 14:30:00', 'Improved diet'),
('770e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440003', 135, 84, 71, 'Hypertension Stage 1', '2024-01-13 09:45:00', 'Exercise program'),
('770e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440003', 132, 81, 69, 'Hypertension Stage 1', '2024-01-12 17:00:00', 'Better control'),
('770e8400-e29b-41d4-a716-446655440019', '660e8400-e29b-41d4-a716-446655440003', 128, 79, 67, 'Elevated', '2024-01-11 13:20:00', 'Good progress'),

-- Mike Brown's readings (Normal, healthy young adult)
('770e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440004', 115, 72, 65, 'Normal', '2024-01-15 11:00:00', 'Post-gym reading'),
('770e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440004', 118, 74, 68, 'Normal', '2024-01-14 16:45:00', 'Afternoon check'),
('770e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440004', 112, 70, 62, 'Normal', '2024-01-13 08:15:00', 'Morning baseline'),
('770e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440004', 120, 76, 70, 'Normal', '2024-01-12 22:30:00', 'Late evening'),
('770e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440004', 116, 73, 66, 'Normal', '2024-01-11 15:10:00', 'Mid-afternoon'),

-- Sarah Doe's readings (Normal for teenager)
('770e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440005', 110, 68, 75, 'Normal', '2024-01-15 15:30:00', 'After school'),
('770e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440005', 108, 66, 78, 'Normal', '2024-01-14 10:00:00', 'Morning reading'),
('770e8400-e29b-41d4-a716-446655440027', '660e8400-e29b-41d4-a716-446655440005', 112, 70, 73, 'Normal', '2024-01-13 18:45:00', 'Evening check'),

-- Robert Doe's readings (Critical hypertension for elderly)
('770e8400-e29b-41d4-a716-446655440028', '660e8400-e29b-41d4-a716-446655440006', 185, 115, 90, 'Hypertensive Crisis', '2024-01-15 06:45:00', 'URGENT - Called doctor'),
('770e8400-e29b-41d4-a716-446655440029', '660e8400-e29b-41d4-a716-446655440006', 165, 105, 88, 'Hypertension Stage 2', '2024-01-14 07:30:00', 'After medication'),
('770e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440006', 158, 98, 85, 'Hypertension Stage 2', '2024-01-13 19:15:00', 'Evening reading'),
('770e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440006', 162, 102, 87, 'Hypertension Stage 2', '2024-01-12 11:20:00', 'Doctor visit day'),
('770e8400-e29b-41d4-a716-446655440032', '660e8400-e29b-41d4-a716-446655440006', 155, 95, 82, 'Hypertension Stage 2', '2024-01-11 14:40:00', 'Afternoon check');

-- Additional readings for trend analysis (last 30 days)
INSERT INTO blood_pressure_readings (id, profile_id, systolic, diastolic, pulse, classification, reading_date, notes) VALUES
-- More John Doe readings
('770e8400-e29b-41d4-a716-446655440033', '660e8400-e29b-41d4-a716-446655440000', 121, 78, 71, 'Elevated', '2024-01-10 09:30:00', 'Weekly check'),
('770e8400-e29b-41d4-a716-446655440034', '660e8400-e29b-41d4-a716-446655440000', 117, 76, 73, 'Normal', '2024-01-09 18:15:00', 'Evening reading'),
('770e8400-e29b-41d4-a716-446655440035', '660e8400-e29b-41d4-a716-446655440000', 123, 79, 69, 'Elevated', '2024-01-08 12:45:00', 'Lunch break'),

-- More Jane Smith readings
('770e8400-e29b-41d4-a716-446655440036', '660e8400-e29b-41d4-a716-446655440001', 139, 89, 81, 'Hypertension Stage 1', '2024-01-10 07:45:00', 'Morning medication'),
('770e8400-e29b-41d4-a716-446655440037', '660e8400-e29b-41d4-a716-446655440001', 133, 83, 77, 'Hypertension Stage 1', '2024-01-09 20:00:00', 'Before dinner'),
('770e8400-e29b-41d4-a716-446655440038', '660e8400-e29b-41d4-a716-446655440001', 137, 87, 79, 'Hypertension Stage 1', '2024-01-08 15:30:00', 'Workday stress'),

-- More Bob Wilson readings
('770e8400-e29b-41d4-a716-446655440039', '660e8400-e29b-41d4-a716-446655440002', 149, 93, 84, 'Hypertension Stage 2', '2024-01-10 08:20:00', 'Daily monitoring'),
('770e8400-e29b-41d4-a716-446655440040', '660e8400-e29b-41d4-a716-446655440002', 153, 99, 89, 'Hypertension Stage 2', '2024-01-09 17:45:00', 'End of day'),
('770e8400-e29b-41d4-a716-446655440041', '660e8400-e29b-41d4-a716-446655440002', 146, 91, 82, 'Hypertension Stage 2', '2024-01-08 13:10:00', 'Midday check');

-- ============================================================================
-- TEST REMINDERS DATA
-- Medication and appointment reminders for comprehensive testing
-- ============================================================================
INSERT INTO reminders (id, profile_id, title, description, time, is_repeating, days_of_week, is_active, created_at) VALUES
-- John Doe's reminders
('880e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Morning BP Check', 'Take blood pressure reading before breakfast', '07:30:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-01 10:00:00'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'Evening Exercise', 'Light cardio for 30 minutes', '18:00:00', TRUE, '["monday", "wednesday", "friday"]', TRUE, '2024-01-01 10:05:00'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 'Doctor Appointment', 'Annual checkup with Dr. Smith', '14:30:00', FALSE, NULL, TRUE, '2024-01-15 09:00:00'),

-- Jane Smith's reminders
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Metformin', 'Take diabetes medication with breakfast', '08:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-02 14:30:00'),
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Lisinopril', 'Take BP medication', '08:05:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-02 14:35:00'),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'BP Reading', 'Morning blood pressure check', '08:30:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-02 14:40:00'),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 'Endocrinologist Visit', 'Quarterly diabetes checkup', '10:00:00', FALSE, NULL, TRUE, '2024-01-20 10:00:00'),

-- Bob Wilson's reminders
('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'Amlodipine', 'Morning BP medication', '07:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-03 09:15:00'),
('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', 'Atorvastatin', 'Evening cholesterol medication', '20:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-03 09:20:00'),
('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440002', 'BP Monitoring', 'Twice daily BP readings', '07:30:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-03 09:25:00'),
('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 'Evening BP Check', 'Second daily BP reading', '19:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-03 09:30:00'),
('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'Cardiologist Appointment', 'Heart health checkup', '15:30:00', FALSE, NULL, TRUE, '2024-01-25 08:00:00'),

-- Alice Johnson's reminders
('880e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440003', 'Metformin XR', 'Extended-release diabetes medication', '19:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-04 16:45:00'),
('880e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440003', 'Blood Sugar Check', 'Fasting glucose test', '06:30:00', TRUE, '["monday", "wednesday", "friday"]', TRUE, '2024-01-04 16:50:00'),
('880e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440003', 'Foot Care', 'Daily diabetic foot inspection', '21:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-04 16:55:00'),

-- Mike Brown's reminders
('880e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440004', 'Gym Session', 'Strength training workout', '17:30:00', TRUE, '["monday", "wednesday", "friday"]', TRUE, '2024-01-05 11:20:00'),
('880e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440004', 'Cardio Day', 'Running or cycling', '18:00:00', TRUE, '["tuesday", "thursday", "saturday"]', TRUE, '2024-01-05 11:25:00'),
('880e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440004', 'Health Check', 'Monthly BP and weight check', '09:00:00', FALSE, NULL, TRUE, '2024-02-05 09:00:00'),

-- Sarah Doe's reminders
('880e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440005', 'Sports Physical', 'Annual sports physical for school', '16:00:00', FALSE, NULL, TRUE, '2024-01-30 12:00:00'),

-- Robert Doe's reminders
('880e8400-e29b-41d4-a716-446655440019', '660e8400-e29b-41d4-a716-446655440006', 'Morning Medications', 'Multiple medications with breakfast', '08:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-07 15:45:00'),
('880e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440006', 'Evening Medications', 'Second dose of daily medications', '20:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-07 15:50:00'),
('880e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440006', 'Emergency BP Check', 'Check immediately if feeling unwell', '00:00:00', FALSE, NULL, TRUE, '2024-01-15 06:45:00'),
('880e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440006', 'Geriatrician Visit', 'Comprehensive elderly care checkup', '11:00:00', FALSE, NULL, TRUE, '2024-01-28 09:00:00');

-- ============================================================================
-- VERIFICATION AND SUMMARY
-- ============================================================================

-- Display summary of inserted data
SELECT 'TEST DATA IMPORT SUMMARY' AS Info;

SELECT 
    'Users' AS Table_Name, 
    COUNT(*) AS Record_Count,
    'All passwords: bloodpressure123' AS Note
FROM users

UNION ALL

SELECT 
    'Profiles' AS Table_Name, 
    COUNT(*) AS Record_Count,
    CONCAT(SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END), ' active profiles') AS Note
FROM profiles

UNION ALL

SELECT 
    'Blood Pressure Readings' AS Table_Name, 
    COUNT(*) AS Record_Count,
    'Across all BP classifications' AS Note
FROM blood_pressure_readings

UNION ALL

SELECT 
    'Reminders' AS Table_Name, 
    COUNT(*) AS Record_Count,
    CONCAT(SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END), ' active reminders') AS Note
FROM reminders;

-- Display classification distribution
SELECT 
    'BLOOD PRESSURE CLASSIFICATION DISTRIBUTION' AS Summary,
    '' AS Classification,
    '' AS Count,
    '' AS Percentage;

SELECT 
    '' AS Summary,
    classification AS Classification,
    COUNT(*) AS Count,
    CONCAT(ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM blood_pressure_readings)), 1), '%') AS Percentage
FROM blood_pressure_readings
GROUP BY classification
ORDER BY 
    CASE classification
        WHEN 'Normal' THEN 1
        WHEN 'Elevated' THEN 2
        WHEN 'Hypertension Stage 1' THEN 3
        WHEN 'Hypertension Stage 2' THEN 4
        WHEN 'Hypertensive Crisis' THEN 5
    END;

SELECT 'Blood Pressure Monitoring Test Data Import Completed Successfully!' AS Status;