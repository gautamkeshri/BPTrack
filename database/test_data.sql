-- Blood Pressure Monitoring Application - MySQL Test Data
-- This file contains sample data for development and testing
-- 
-- DEFAULT LOGIN CREDENTIALS FOR ALL USERS:
-- Username: See individual users below
-- Password: bloodpressure123 (same for all users for simplicity)
--
-- Test Users:
-- - johndoe / john.doe@email.com
-- - janesmith / jane.smith@email.com  
-- - bobwilson / bob.wilson@email.com
-- - alicejohnson / alice.johnson@email.com
-- - mikebrown / mike.brown@email.com

USE blood_pressure_app;

-- ============================================================================
-- CLEAR EXISTING DATA (for clean test environment)
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE blood_pressure_readings;
TRUNCATE TABLE reminders;
TRUNCATE TABLE profiles;
TRUNCATE TABLE users;
TRUNCATE TABLE sessions;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- TEST USERS DATA
-- Password for all users: "bloodpressure123" (MD5: 482c811da5d5b4bc6d497ffa98491e38)
-- ============================================================================
INSERT INTO users (id, username, email, password_hash, full_name, is_active, last_login, created_at) VALUES
-- John Doe - Primary test user, password: bloodpressure123
('550e8400-e29b-41d4-a716-446655440000', 'johndoe', 'john.doe@email.com', '482c811da5d5b4bc6d497ffa98491e38', 'John Doe', TRUE, '2024-01-15 08:30:00', '2024-01-01 10:00:00'),

-- Jane Smith - Secondary test user, password: bloodpressure123  
('550e8400-e29b-41d4-a716-446655440001', 'janesmith', 'jane.smith@email.com', '482c811da5d5b4bc6d497ffa98491e38', 'Jane Smith', TRUE, '2024-01-14 19:45:00', '2024-01-02 14:30:00'),

-- Bob Wilson - Test user with hypertension, password: bloodpressure123
('550e8400-e29b-41d4-a716-446655440002', 'bobwilson', 'bob.wilson@email.com', '482c811da5d5b4bc6d497ffa98491e38', 'Bob Wilson', TRUE, '2024-01-13 07:15:00', '2024-01-03 09:15:00'),

-- Alice Johnson - Test user with diabetes, password: bloodpressure123
('550e8400-e29b-41d4-a716-446655440003', 'alicejohnson', 'alice.johnson@email.com', '482c811da5d5b4bc6d497ffa98491e38', 'Alice Johnson', TRUE, '2024-01-12 20:30:00', '2024-01-04 16:45:00'),

-- Mike Brown - Young adult test user, password: bloodpressure123
('550e8400-e29b-41d4-a716-446655440004', 'mikebrown', 'mike.brown@email.com', '482c811da5d5b4bc6d497ffa98491e38', 'Mike Brown', TRUE, '2024-01-11 12:00:00', '2024-01-05 11:20:00');

-- ============================================================================
-- TEST PROFILES DATA
-- Multiple family profiles for comprehensive testing
-- ============================================================================
INSERT INTO profiles (id, name, gender, age, medical_conditions, is_active, created_at) VALUES
-- John Doe - 46-year-old male with normal BP
('660e8400-e29b-41d4-a716-446655440000', 'John Doe', 'male', 46, '[]', TRUE, '2024-01-01 10:00:00'),

-- Jane Smith - 38-year-old female with diabetes and hypertension
('660e8400-e29b-41d4-a716-446655440001', 'Jane Smith', 'female', 38, '["Diabetes", "Hypertension"]', FALSE, '2024-01-02 14:30:00'),

-- Bob Wilson - 62-year-old male with heart disease
('660e8400-e29b-41d4-a716-446655440002', 'Bob Wilson', 'male', 62, '["Heart Disease", "High Cholesterol"]', FALSE, '2024-01-03 09:15:00'),

-- Alice Johnson - 54-year-old female with diabetes
('660e8400-e29b-41d4-a716-446655440003', 'Alice Johnson', 'female', 54, '["Diabetes"]', FALSE, '2024-01-04 16:45:00'),

-- Mike Brown - 28-year-old male, healthy
('660e8400-e29b-41d4-a716-446655440004', 'Mike Brown', 'male', 28, '[]', FALSE, '2024-01-05 11:20:00'),

-- Sarah Doe - 16-year-old female, John's daughter
('660e8400-e29b-41d4-a716-446655440005', 'Sarah Doe', 'female', 16, '[]', FALSE, '2024-01-06 13:10:00'),

-- Robert Doe - 72-year-old male, John's father
('660e8400-e29b-41d4-a716-446655440006', 'Robert Doe', 'male', 72, '["Hypertension", "Diabetes", "Arthritis"]', FALSE, '2024-01-07 15:45:00');

-- ============================================================================
-- TEST BLOOD PRESSURE READINGS DATA
-- Comprehensive dataset covering all BP classifications and realistic patterns
-- ============================================================================

-- John Doe readings (Normal to Elevated range) - 30 days of data
INSERT INTO blood_pressure_readings (id, profile_id, systolic, diastolic, pulse, reading_date, classification, created_at) VALUES
-- Week 1 - Generally normal
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 118, 78, 72, '2024-01-15 08:30:00', 'Normal', '2024-01-15 08:30:00'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 115, 75, 68, '2024-01-14 19:15:00', 'Normal', '2024-01-14 19:15:00'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 119, 79, 74, '2024-01-13 08:45:00', 'Normal', '2024-01-13 08:45:00'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440000', 122, 79, 70, '2024-01-12 20:30:00', 'Elevated', '2024-01-12 20:30:00'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440000', 117, 76, 73, '2024-01-11 08:20:00', 'Normal', '2024-01-11 08:20:00'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440000', 121, 78, 71, '2024-01-10 19:45:00', 'Elevated', '2024-01-10 19:45:00'),
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440000', 116, 77, 69, '2024-01-09 08:15:00', 'Normal', '2024-01-09 08:15:00'),

-- Week 2 - Some elevated readings
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440000', 125, 79, 75, '2024-01-08 20:00:00', 'Elevated', '2024-01-08 20:00:00'),
('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440000', 123, 78, 72, '2024-01-07 08:30:00', 'Elevated', '2024-01-07 08:30:00'),
('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440000', 119, 77, 74, '2024-01-06 19:20:00', 'Normal', '2024-01-06 19:20:00'),
('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440000', 127, 79, 76, '2024-01-05 08:40:00', 'Elevated', '2024-01-05 08:40:00'),
('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440000', 118, 78, 70, '2024-01-04 20:15:00', 'Normal', '2024-01-04 20:15:00'),
('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440000', 120, 79, 73, '2024-01-03 08:25:00', 'Normal', '2024-01-03 08:25:00'),
('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440000', 124, 78, 71, '2024-01-02 19:50:00', 'Elevated', '2024-01-02 19:50:00');

-- Jane Smith readings (Stage 1 Hypertension) - 25 days of data
INSERT INTO blood_pressure_readings (id, profile_id, systolic, diastolic, pulse, reading_date, classification, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440001', 135, 85, 78, '2024-01-15 09:00:00', 'Hypertension Stage 1', '2024-01-15 09:00:00'),
('770e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440001', 132, 83, 81, '2024-01-14 18:30:00', 'Hypertension Stage 1', '2024-01-14 18:30:00'),
('770e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440001', 138, 87, 79, '2024-01-13 09:15:00', 'Hypertension Stage 1', '2024-01-13 09:15:00'),
('770e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440001', 130, 82, 82, '2024-01-12 19:45:00', 'Hypertension Stage 1', '2024-01-12 19:45:00'),
('770e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440001', 134, 84, 77, '2024-01-11 09:30:00', 'Hypertension Stage 1', '2024-01-11 09:30:00'),
('770e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440001', 136, 86, 80, '2024-01-10 18:20:00', 'Hypertension Stage 1', '2024-01-10 18:20:00'),
('770e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440001', 131, 81, 83, '2024-01-09 09:45:00', 'Hypertension Stage 1', '2024-01-09 09:45:00'),
('770e8400-e29b-41d4-a716-446655440027', '660e8400-e29b-41d4-a716-446655440001', 139, 88, 78, '2024-01-08 19:10:00', 'Hypertension Stage 1', '2024-01-08 19:10:00'),
('770e8400-e29b-41d4-a716-446655440028', '660e8400-e29b-41d4-a716-446655440001', 133, 85, 81, '2024-01-07 09:20:00', 'Hypertension Stage 1', '2024-01-07 09:20:00'),
('770e8400-e29b-41d4-a716-446655440029', '660e8400-e29b-41d4-a716-446655440001', 137, 87, 79, '2024-01-06 18:40:00', 'Hypertension Stage 1', '2024-01-06 18:40:00');

-- Bob Wilson readings (Stage 2 Hypertension) - 20 days of data
INSERT INTO blood_pressure_readings (id, profile_id, systolic, diastolic, pulse, reading_date, classification, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440040', '660e8400-e29b-41d4-a716-446655440002', 145, 92, 85, '2024-01-15 07:30:00', 'Hypertension Stage 2', '2024-01-15 07:30:00'),
('770e8400-e29b-41d4-a716-446655440041', '660e8400-e29b-41d4-a716-446655440002', 148, 95, 87, '2024-01-14 20:15:00', 'Hypertension Stage 2', '2024-01-14 20:15:00'),
('770e8400-e29b-41d4-a716-446655440042', '660e8400-e29b-41d4-a716-446655440002', 142, 90, 89, '2024-01-13 07:45:00', 'Hypertension Stage 2', '2024-01-13 07:45:00'),
('770e8400-e29b-41d4-a716-446655440043', '660e8400-e29b-41d4-a716-446655440002', 150, 94, 84, '2024-01-12 21:00:00', 'Hypertension Stage 2', '2024-01-12 21:00:00'),
('770e8400-e29b-41d4-a716-446655440044', '660e8400-e29b-41d4-a716-446655440002', 146, 93, 86, '2024-01-11 07:20:00', 'Hypertension Stage 2', '2024-01-11 07:20:00'),
('770e8400-e29b-41d4-a716-446655440045', '660e8400-e29b-41d4-a716-446655440002', 144, 91, 88, '2024-01-10 20:30:00', 'Hypertension Stage 2', '2024-01-10 20:30:00'),
('770e8400-e29b-41d4-a716-446655440046', '660e8400-e29b-41d4-a716-446655440002', 149, 96, 83, '2024-01-09 07:50:00', 'Hypertension Stage 2', '2024-01-09 07:50:00'),
('770e8400-e29b-41d4-a716-446655440047', '660e8400-e29b-41d4-a716-446655440002', 143, 92, 90, '2024-01-08 21:15:00', 'Hypertension Stage 2', '2024-01-08 21:15:00'),
('770e8400-e29b-41d4-a716-446655440048', '660e8400-e29b-41d4-a716-446655440002', 147, 94, 85, '2024-01-07 07:30:00', 'Hypertension Stage 2', '2024-01-07 07:30:00'),
('770e8400-e29b-41d4-a716-446655440049', '660e8400-e29b-41d4-a716-446655440002', 141, 89, 87, '2024-01-06 20:45:00', 'Hypertension Stage 2', '2024-01-06 20:45:00');

-- Alice Johnson readings (Mixed Stage 1 and improving) - 18 days of data
INSERT INTO blood_pressure_readings (id, profile_id, systolic, diastolic, pulse, reading_date, classification, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440060', '660e8400-e29b-41d4-a716-446655440003', 128, 82, 75, '2024-01-15 10:00:00', 'Elevated', '2024-01-15 10:00:00'),
('770e8400-e29b-41d4-a716-446655440061', '660e8400-e29b-41d4-a716-446655440003', 133, 85, 78, '2024-01-14 17:30:00', 'Hypertension Stage 1', '2024-01-14 17:30:00'),
('770e8400-e29b-41d4-a716-446655440062', '660e8400-e29b-41d4-a716-446655440003', 125, 80, 76, '2024-01-13 10:15:00', 'Elevated', '2024-01-13 10:15:00'),
('770e8400-e29b-41d4-a716-446655440063', '660e8400-e29b-41d4-a716-446655440003', 135, 87, 79, '2024-01-12 18:45:00', 'Hypertension Stage 1', '2024-01-12 18:45:00'),
('770e8400-e29b-41d4-a716-446655440064', '660e8400-e29b-41d4-a716-446655440003', 130, 83, 77, '2024-01-11 10:30:00', 'Hypertension Stage 1', '2024-01-11 10:30:00'),
('770e8400-e29b-41d4-a716-446655440065', '660e8400-e29b-41d4-a716-446655440003', 126, 81, 74, '2024-01-10 17:20:00', 'Elevated', '2024-01-10 17:20:00'),
('770e8400-e29b-41d4-a716-446655440066', '660e8400-e29b-41d4-a716-446655440003', 132, 84, 80, '2024-01-09 10:45:00', 'Hypertension Stage 1', '2024-01-09 10:45:00'),
('770e8400-e29b-41d4-a716-446655440067', '660e8400-e29b-41d4-a716-446655440003', 129, 82, 78, '2024-01-08 18:10:00', 'Elevated', '2024-01-08 18:10:00');

-- Mike Brown readings (Normal, young adult) - 15 days of data
INSERT INTO blood_pressure_readings (id, profile_id, systolic, diastolic, pulse, reading_date, classification, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440080', '660e8400-e29b-41d4-a716-446655440004', 115, 72, 65, '2024-01-15 11:00:00', 'Normal', '2024-01-15 11:00:00'),
('770e8400-e29b-41d4-a716-446655440081', '660e8400-e29b-41d4-a716-446655440004', 118, 75, 68, '2024-01-14 22:30:00', 'Normal', '2024-01-14 22:30:00'),
('770e8400-e29b-41d4-a716-446655440082', '660e8400-e29b-41d4-a716-446655440004', 112, 70, 66, '2024-01-13 11:15:00', 'Normal', '2024-01-13 11:15:00'),
('770e8400-e29b-41d4-a716-446655440083', '660e8400-e29b-41d4-a716-446655440004', 119, 76, 69, '2024-01-12 23:45:00', 'Normal', '2024-01-12 23:45:00'),
('770e8400-e29b-41d4-a716-446655440084', '660e8400-e29b-41d4-a716-446655440004', 116, 73, 67, '2024-01-11 11:30:00', 'Normal', '2024-01-11 11:30:00'),
('770e8400-e29b-41d4-a716-446655440085', '660e8400-e29b-41d4-a716-446655440004', 117, 74, 70, '2024-01-10 22:20:00', 'Normal', '2024-01-10 22:20:00'),
('770e8400-e29b-41d4-a716-446655440086', '660e8400-e29b-41d4-a716-446655440004', 114, 71, 64, '2024-01-09 11:45:00', 'Normal', '2024-01-09 11:45:00');

-- Robert Doe readings (Elderly with severe hypertension) - 12 days of data
INSERT INTO blood_pressure_readings (id, profile_id, systolic, diastolic, pulse, reading_date, classification, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440100', '660e8400-e29b-41d4-a716-446655440006', 165, 98, 92, '2024-01-15 06:30:00', 'Hypertension Stage 2', '2024-01-15 06:30:00'),
('770e8400-e29b-41d4-a716-446655440101', '660e8400-e29b-41d4-a716-446655440006', 170, 102, 89, '2024-01-14 21:15:00', 'Hypertension Stage 2', '2024-01-14 21:15:00'),
('770e8400-e29b-41d4-a716-446655440102', '660e8400-e29b-41d4-a716-446655440006', 162, 95, 94, '2024-01-13 06:45:00', 'Hypertension Stage 2', '2024-01-13 06:45:00'),
('770e8400-e29b-41d4-a716-446655440103', '660e8400-e29b-41d4-a716-446655440006', 168, 100, 91, '2024-01-12 22:00:00', 'Hypertension Stage 2', '2024-01-12 22:00:00'),
('770e8400-e29b-41d4-a716-446655440104', '660e8400-e29b-41d4-a716-446655440006', 185, 125, 88, '2024-01-11 06:20:00', 'Hypertensive Crisis', '2024-01-11 06:20:00'),
('770e8400-e29b-41d4-a716-446655440105', '660e8400-e29b-41d4-a716-446655440006', 175, 105, 95, '2024-01-10 21:30:00', 'Hypertension Stage 2', '2024-01-10 21:30:00');

-- ============================================================================
-- TEST REMINDERS DATA
-- Realistic medication and appointment reminders
-- ============================================================================
INSERT INTO reminders (id, profile_id, title, time, is_repeating, days_of_week, is_active, created_at) VALUES
-- John Doe reminders
('880e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Morning blood pressure check', '08:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-01 10:00:00'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'Evening blood pressure check', '19:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-01 10:05:00'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 'Doctor appointment - Dr. Johnson', '14:30:00', FALSE, NULL, TRUE, '2024-01-01 10:10:00'),

-- Jane Smith reminders (with medication)
('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440001', 'Take Lisinopril 10mg', '07:30:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-02 14:30:00'),
('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440001', 'Take Metformin 500mg', '08:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-02 14:35:00'),
('880e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440001', 'Check blood pressure', '09:00:00', TRUE, '["monday", "wednesday", "friday"]', TRUE, '2024-01-02 14:40:00'),
('880e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440001', 'Cardiology follow-up appointment', '10:00:00', FALSE, NULL, TRUE, '2024-01-02 14:45:00'),

-- Bob Wilson reminders (intensive monitoring)
('880e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440002', 'Take Amlodipine 5mg', '07:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-03 09:15:00'),
('880e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440002', 'Take Atorvastatin 20mg', '20:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-03 09:20:00'),
('880e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440002', 'Morning BP check', '07:30:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-03 09:25:00'),
('880e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440002', 'Evening BP check', '20:30:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-03 09:30:00'),

-- Alice Johnson reminders (diabetes management)
('880e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440003', 'Check blood sugar', '06:30:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-04 16:45:00'),
('880e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440003', 'Take Metformin 1000mg', '07:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-04 16:50:00'),
('880e8400-e29b-41d4-a716-446655440032', '660e8400-e29b-41d4-a716-446655440003', 'Blood pressure check', '10:00:00', TRUE, '["monday", "wednesday", "friday", "sunday"]', TRUE, '2024-01-04 16:55:00'),
('880e8400-e29b-41d4-a716-446655440033', '660e8400-e29b-41d4-a716-446655440003', 'Endocrinologist appointment', '15:30:00', FALSE, NULL, TRUE, '2024-01-04 17:00:00'),

-- Mike Brown reminders (fitness focused)
('880e8400-e29b-41d4-a716-446655440040', '660e8400-e29b-41d4-a716-446655440004', 'Pre-workout BP check', '17:00:00', TRUE, '["monday", "wednesday", "friday"]', TRUE, '2024-01-05 11:20:00'),
('880e8400-e29b-41d4-a716-446655440041', '660e8400-e29b-41d4-a716-446655440004', 'Post-workout BP check', '19:00:00', TRUE, '["monday", "wednesday", "friday"]', TRUE, '2024-01-05 11:25:00'),
('880e8400-e29b-41d4-a716-446655440042', '660e8400-e29b-41d4-a716-446655440004', 'Weekly health check', '11:00:00', TRUE, '["sunday"]', TRUE, '2024-01-05 11:30:00'),

-- Sarah Doe reminders (teen monitoring)
('880e8400-e29b-41d4-a716-446655440050', '660e8400-e29b-41d4-a716-446655440005', 'Weekly BP check', '16:00:00', TRUE, '["saturday"]', TRUE, '2024-01-06 13:10:00'),

-- Robert Doe reminders (elderly comprehensive care)
('880e8400-e29b-41d4-a716-446655440060', '660e8400-e29b-41d4-a716-446655440006', 'Take Losartan 50mg', '06:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-07 15:45:00'),
('880e8400-e29b-41d4-a716-446655440061', '660e8400-e29b-41d4-a716-446655440006', 'Take Hydrochlorothiazide 25mg', '06:30:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-07 15:50:00'),
('880e8400-e29b-41d4-a716-446655440062', '660e8400-e29b-41d4-a716-446655440006', 'Morning BP check', '06:30:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-07 15:55:00'),
('880e8400-e29b-41d4-a716-446655440063', '660e8400-e29b-41d4-a716-446655440006', 'Evening BP check', '21:00:00', TRUE, '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', TRUE, '2024-01-07 16:00:00'),
('880e8400-e29b-41d4-a716-446655440064', '660e8400-e29b-41d4-a716-446655440006', 'Geriatrician appointment', '09:00:00', FALSE, NULL, TRUE, '2024-01-07 16:05:00');

-- ============================================================================
-- DATA VALIDATION AND SUMMARY
-- ============================================================================

-- Verify data integrity
SELECT 'Profiles Count' as metric, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Users Count', COUNT(*) FROM users
UNION ALL
SELECT 'Total Readings', COUNT(*) FROM blood_pressure_readings
UNION ALL
SELECT 'Total Reminders', COUNT(*) FROM reminders
UNION ALL
SELECT 'Active Reminders', COUNT(*) FROM reminders WHERE is_active = TRUE;

-- Show classification distribution
SELECT 
    classification,
    COUNT(*) as count,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM blood_pressure_readings)), 1) as percentage
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

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================
/*
LOGIN CREDENTIALS FOR TESTING:

All users have the same password: bloodpressure123

User Accounts:
1. johndoe / john.doe@email.com
   - Profile: John Doe (46M, Normal BP range)
   - 15 readings over 2 weeks
   - 3 reminders (daily BP checks + appointment)

2. janesmith / jane.smith@email.com  
   - Profile: Jane Smith (38F, Diabetes + Hypertension)
   - 10 readings showing Stage 1 Hypertension
   - 4 reminders (medications + BP monitoring)

3. bobwilson / bob.wilson@email.com
   - Profile: Bob Wilson (62M, Heart Disease)
   - 10 readings showing Stage 2 Hypertension
   - 4 reminders (medications + intensive monitoring)

4. alicejohnson / alice.johnson@email.com
   - Profile: Alice Johnson (54F, Diabetes)
   - 8 readings showing improvement from Stage 1 to Elevated
   - 4 reminders (diabetes + BP management)

5. mikebrown / mike.brown@email.com
   - Profile: Mike Brown (28M, Healthy)
   - 7 readings all in Normal range
   - 3 reminders (fitness-related monitoring)

Additional Profiles (for family testing):
- Sarah Doe (16F, teen monitoring)
- Robert Doe (72M, elderly with multiple conditions)

Each profile includes realistic medical conditions, age-appropriate readings,
and relevant reminders for comprehensive application testing.
*/