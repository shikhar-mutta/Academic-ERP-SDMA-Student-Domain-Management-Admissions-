-- =====================================================
-- Data Insertion Script for Academic ERP Database
-- =====================================================
-- This script inserts sample data for domains and students
-- Execute create_schema.sql first before running this script
-- =====================================================

USE erp_admission;

-- =====================================================
-- 1. DOMAINS (Academic Programs)
-- =====================================================
INSERT INTO domains (program, batch, capacity, exam_name, cutoff_marks, created_at) VALUES
('Bachelor of Technology in CSE', '2024', 60, 'JEE Main', 75.00, NOW()),
('Bachelor of Technology in ECE', '2023', 60, 'JEE Main', 75.00, NOW()),
('Bachelor of Technology in ME', '2022', 60, 'JEE Main', 75.00, NOW()),
('Master of Technology in CSE', '2024', 30, 'GATE', 65.00, NOW()),
('Master of Technology in Data Science', '2023', 30, 'GATE', 65.00, NOW()),
('Master of Science in Data Science', '2024', 25, 'GRE', 50.00, NOW()),
('Master of Science in AI', '2023', 25, 'GRE', 50.00, NOW()),
('Doctor of Philosophy in Computer Science', '2024', 10, 'NET', 55.00, NOW());

-- =====================================================
-- 2. STUDENTS
-- =====================================================
-- Note: is_active is set to 1 (true) if exam_marks >= domain cutoff_marks, else 0 (false)
-- =====================================================
INSERT INTO students (roll_number, first_name, last_name, email, domain_id, join_year, exam_marks, is_active, created_at) VALUES
-- Students in Domain 1 (B.Tech CSE 2024) - Cutoff: 75.00
('BT2024001', 'Aarav', 'Sharma', 'aarav.sharma@student.university.edu', 1, 2024, 80.50, 1, NOW()),
('BT2024002', 'Isha', 'Patel', 'isha.patel@student.university.edu', 1, 2024, 78.25, 1, NOW()),
('BT2024003', 'Rohan', 'Kumar', 'rohan.kumar@student.university.edu', 1, 2024, 82.00, 1, NOW()),
('BT2024004', 'Ananya', 'Reddy', 'ananya.reddy@student.university.edu', 1, 2024, 76.75, 1, NOW()),
('BT2024005', 'Arjun', 'Singh', 'arjun.singh@student.university.edu', 1, 2024, 85.00, 1, NOW()),
('BT2024006', 'Priya', 'Gupta', 'priya.gupta@student.university.edu', 1, 2024, 77.50, 1, NOW()),
('BT2024007', 'Vikram', 'Verma', 'vikram.verma@student.university.edu', 1, 2024, 79.00, 1, NOW()),
('BT2024008', 'Ravi', 'Kumar', 'ravi.kumar@student.university.edu', 1, 2024, 72.00, 0, NOW()),
('BT2024009', 'Sita', 'Devi', 'sita.devi@student.university.edu', 1, 2024, 74.50, 0, NOW()),
('BT2024010', 'Kiran', 'Desai', 'kiran.desai@student.university.edu', 1, 2024, 81.25, 1, NOW()),
('BT2024011', 'Sakshi', 'Mehta', 'sakshi.mehta@student.university.edu', 1, 2024, 83.75, 1, NOW()),
('BT2024012', 'Vivek', 'Shah', 'vivek.shah@student.university.edu', 1, 2024, 78.90, 1, NOW()),
('BT2024013', 'Radha', 'Iyer', 'radha.iyer@student.university.edu', 1, 2024, 76.20, 1, NOW()),

-- Students in Domain 2 (B.Tech ECE 2023) - Cutoff: 75.00
('BT2023001', 'Sneha', 'Joshi', 'sneha.joshi@student.university.edu', 2, 2023, 77.50, 1, NOW()),
('BT2023002', 'Rahul', 'Nair', 'rahul.nair@student.university.edu', 2, 2023, 79.25, 1, NOW()),
('BT2023003', 'Kavita', 'Krishnan', 'kavita.krishnan@student.university.edu', 2, 2023, 75.00, 1, NOW()),
('BT2023004', 'Amit', 'Menon', 'amit.menon@student.university.edu', 2, 2023, 88.00, 1, NOW()),
('BT2023005', 'Meera', 'Iyer', 'meera.iyer@student.university.edu', 2, 2023, 78.50, 1, NOW()),
('BT2023006', 'Rohan', 'Deshmukh', 'rohan.deshmukh@student.university.edu', 2, 2023, 76.80, 1, NOW()),
('BT2023007', 'Anjali', 'Kulkarni', 'anjali.kulkarni@student.university.edu', 2, 2023, 81.40, 1, NOW()),
('BT2023008', 'Siddharth', 'Bhat', 'siddharth.bhat@student.university.edu', 2, 2023, 79.60, 1, NOW()),
('BT2023009', 'Pooja', 'Shetty', 'pooja.shetty@student.university.edu', 2, 2023, 77.20, 1, NOW()),

-- Students in Domain 3 (B.Tech ME 2022) - Cutoff: 75.00
('BT2022001', 'Arjun', 'Malhotra', 'arjun.malhotra@student.university.edu', 3, 2022, 81.00, 1, NOW()),
('BT2022002', 'Divya', 'Chopra', 'divya.chopra@student.university.edu', 3, 2022, 83.50, 1, NOW()),
('BT2022003', 'Karan', 'Bansal', 'karan.bansal@student.university.edu', 3, 2022, 77.00, 1, NOW()),
('BT2022004', 'Riya', 'Sharma', 'riya.sharma@student.university.edu', 3, 2022, 80.00, 1, NOW()),
('BT2022005', 'Aditya', 'Patel', 'aditya.patel@student.university.edu', 3, 2022, 84.25, 1, NOW()),
('BT2022006', 'Nisha', 'Agarwal', 'nisha.agarwal@student.university.edu', 3, 2022, 78.50, 1, NOW()),
('BT2022007', 'Rohit', 'Jain', 'rohit.jain@student.university.edu', 3, 2022, 82.75, 1, NOW()),

-- Students in Domain 4 (M.Tech CSE 2024) - Cutoff: 65.00
('MT2024001', 'Pooja', 'Kumar', 'pooja.kumar@student.university.edu', 4, 2024, 68.00, 1, NOW()),
('MT2024002', 'Siddharth', 'Reddy', 'siddharth.reddy@student.university.edu', 4, 2024, 70.50, 1, NOW()),
('MT2024003', 'Neha', 'Singh', 'neha.singh@student.university.edu', 4, 2024, 66.75, 1, NOW()),
('MT2024004', 'Varun', 'Gupta', 'varun.gupta@student.university.edu', 4, 2024, 69.25, 1, NOW()),
('MT2024005', 'Shreya', 'Verma', 'shreya.verma@student.university.edu', 4, 2024, 72.00, 1, NOW()),
('MT2024006', 'Aman', 'Shah', 'aman.shah@student.university.edu', 4, 2024, 62.00, 0, NOW()),
('MT2024007', 'Kritika', 'Bansal', 'kritika.bansal@student.university.edu', 4, 2024, 67.50, 1, NOW()),
('MT2024008', 'Rishabh', 'Agarwal', 'rishabh.agarwal@student.university.edu', 4, 2024, 71.25, 1, NOW()),
('MT2024009', 'Anushka', 'Jain', 'anushka.jain@student.university.edu', 4, 2024, 69.80, 1, NOW()),

-- Students in Domain 5 (M.Tech Data Science 2023) - Cutoff: 65.00
('MT2023001', 'Kunal', 'Joshi', 'kunal.joshi@student.university.edu', 5, 2023, 68.50, 1, NOW()),
('MT2023002', 'Anjali', 'Nair', 'anjali.nair@student.university.edu', 5, 2023, 67.00, 1, NOW()),
('MT2023003', 'Rohit', 'Krishnan', 'rohit.krishnan@student.university.edu', 5, 2023, 66.25, 1, NOW()),
('MT2023004', 'Tanvi', 'Menon', 'tanvi.menon@student.university.edu', 5, 2023, 70.00, 1, NOW()),
('MT2023005', 'Nikhil', 'Iyer', 'nikhil.iyer@student.university.edu', 5, 2023, 65.75, 1, NOW()),
('MT2023006', 'Sneha', 'Desai', 'sneha.desai@student.university.edu', 5, 2023, 69.40, 1, NOW()),
('MT2023007', 'Vikram', 'Patil', 'vikram.patil@student.university.edu', 5, 2023, 66.90, 1, NOW()),

-- Students in Domain 6 (M.Sc Data Science 2024) - Cutoff: 50.00 (converted from GRE 300)
('MS2024001', 'Swati', 'Malhotra', 'swati.malhotra@student.university.edu', 6, 2024, 62.50, 1, NOW()),
('MS2024002', 'Harsh', 'Chopra', 'harsh.chopra@student.university.edu', 6, 2024, 56.88, 1, NOW()),
('MS2024003', 'Jyoti', 'Bansal', 'jyoti.bansal@student.university.edu', 6, 2024, 53.44, 1, NOW()),
('MS2024004', 'Raj', 'Mehta', 'raj.mehta@student.university.edu', 6, 2024, 43.75, 0, NOW()),
('MS2024005', 'Anita', 'Saxena', 'anita.saxena@student.university.edu', 6, 2024, 60.31, 1, NOW()),

-- Students in Domain 7 (M.Sc AI 2023) - Cutoff: 50.00 (converted from GRE 300)
('MS2023001', 'Manish', 'Sharma', 'manish.sharma@student.university.edu', 7, 2023, 68.75, 1, NOW()),
('MS2023002', 'Ankit', 'Patel', 'ankit.patel@student.university.edu', 7, 2023, 51.56, 1, NOW()),
('MS2023003', 'Ritu', 'Verma', 'ritu.verma@student.university.edu', 7, 2023, 65.63, 1, NOW()),
('MS2023004', 'Saurabh', 'Tiwari', 'saurabh.tiwari@student.university.edu', 7, 2023, 59.69, 1, NOW()),
('MS2023005', 'Preeti', 'Yadav', 'preeti.yadav@student.university.edu', 7, 2023, 48.13, 0, NOW()),

-- Students in Domain 8 (Ph.D Computer Science 2024) - Cutoff: 55.00
('PH2024001', 'Dr. Priyanka', 'Kumar', 'priyanka.kumar@student.university.edu', 8, 2024, 58.00, 1, NOW()),
('PH2024002', 'Dr. Rajesh', 'Reddy', 'rajesh.reddy@student.university.edu', 8, 2024, 56.50, 1, NOW()),
('PH2024003', 'Dr. Sunita', 'Rao', 'sunita.rao@student.university.edu', 8, 2024, 52.00, 0, NOW()),
('PH2024004', 'Dr. Amit', 'Sharma', 'amit.sharma@student.university.edu', 8, 2024, 57.25, 1, NOW()),
('PH2024005', 'Dr. Kavita', 'Nair', 'kavita.nair@student.university.edu', 8, 2024, 59.50, 1, NOW());

-- =====================================================
-- Script Execution Complete
-- =====================================================
-- Summary:
-- - 8 Domains inserted (with exam_name and cutoff_marks)
-- - 60 Students inserted (with is_active set based on exam_marks >= domain cutoff)
--   * Domain 1 (B.Tech CSE 2024): 13 students
--   * Domain 2 (B.Tech ECE 2023): 9 students
--   * Domain 3 (B.Tech ME 2022): 7 students
--   * Domain 4 (M.Tech CSE 2024): 9 students
--   * Domain 5 (M.Tech Data Science 2023): 7 students
--   * Domain 6 (M.Sc Data Science 2024): 5 students
--   * Domain 7 (M.Sc AI 2023): 5 students
--   * Domain 8 (Ph.D Computer Science 2024): 5 students
-- =====================================================
