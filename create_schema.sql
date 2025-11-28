-- =====================================================
-- Database Schema Creation Script for Academic ERP
-- =====================================================
-- This script creates only the essential tables:
-- - domains: Academic programs/domains
-- - students: Student records
-- Execute this script first before inserting data
-- =====================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS erp_admission;
USE erp_admission;

-- =====================================================
-- 1. DOMAINS TABLE
-- =====================================================
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS domains;

CREATE TABLE domains (
    domain_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    program VARCHAR(120) NOT NULL,
    batch VARCHAR(50),
    capacity INT CHECK (capacity >= 0 AND capacity <= 150),
    exam_name VARCHAR(120),
    cutoff_marks DECIMAL(5,2) CHECK (cutoff_marks >= 0 AND cutoff_marks <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_domain_program (program),
    INDEX idx_domain_batch (batch)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. STUDENTS TABLE
-- =====================================================
CREATE TABLE students (
    student_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roll_number VARCHAR(50) UNIQUE,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    domain_id BIGINT NOT NULL,
    join_year INT NOT NULL,
    exam_marks DECIMAL(5,2) NOT NULL CHECK (exam_marks >= 0 AND exam_marks <= 100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(domain_id) ON DELETE CASCADE,
    INDEX idx_student_roll (roll_number),
    INDEX idx_student_email (email),
    INDEX idx_student_domain (domain_id),
    INDEX idx_student_join_year (join_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Schema Creation Complete
-- =====================================================
-- Tables created:
-- - domains: Academic programs with exam requirements
-- - students: Student records linked to domains
-- =====================================================
