-- Sample data for testing BPTrack D1 database

-- Insert sample profiles
INSERT INTO profiles (id, name, gender, age, medical_conditions, is_active, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'male', 46, '[]', 1, strftime('%s', 'now') * 1000),
  ('550e8400-e29b-41d4-a716-446655440002', 'Dad', 'male', 76, '["Diabetic"]', 0, strftime('%s', 'now') * 1000),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mom', 'female', 73, '[]', 0, strftime('%s', 'now') * 1000);

-- Insert sample blood pressure readings for John Doe
INSERT INTO blood_pressure_readings (id, profile_id, systolic, diastolic, pulse, weight, notes, reading_date, classification, pulse_pressure, mean_arterial_pressure, created_at) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 118, 78, 72, 75, 'Feeling good', strftime('%s', 'now', '-1 day') * 1000, 'Normal', 40, 91, strftime('%s', 'now', '-1 day') * 1000),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 122, 80, 68, 75, NULL, strftime('%s', 'now', '-2 days') * 1000, 'Elevated', 42, 94, strftime('%s', 'now', '-2 days') * 1000),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 115, 75, 70, 74, NULL, strftime('%s', 'now', '-3 days') * 1000, 'Normal', 40, 88, strftime('%s', 'now', '-3 days') * 1000);

-- Insert sample blood pressure readings for Dad
INSERT INTO blood_pressure_readings (id, profile_id, systolic, diastolic, pulse, weight, notes, reading_date, classification, pulse_pressure, mean_arterial_pressure, created_at) VALUES
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 145, 92, 78, 80, 'After medication', strftime('%s', 'now', '-1 day') * 1000, 'Hypertension Stage 2', 53, 110, strftime('%s', 'now', '-1 day') * 1000),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 138, 88, 75, 80, NULL, strftime('%s', 'now', '-2 days') * 1000, 'Hypertension Stage 1', 50, 105, strftime('%s', 'now', '-2 days') * 1000);

-- Insert sample reminders
INSERT INTO reminders (id, profile_id, title, time, is_repeating, days_of_week, is_active, created_at) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Morning BP Check', '08:00', 1, '["monday","tuesday","wednesday","thursday","friday"]', 1, strftime('%s', 'now') * 1000),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Take Blood Pressure Medication', '09:00', 1, '["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]', 1, strftime('%s', 'now') * 1000),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Evening BP Check', '20:00', 1, '["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]', 1, strftime('%s', 'now') * 1000);
