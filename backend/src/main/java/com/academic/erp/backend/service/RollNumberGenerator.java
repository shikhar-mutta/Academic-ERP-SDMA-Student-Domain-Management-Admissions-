package com.academic.erp.backend.service;

import org.springframework.stereotype.Component;

@Component
public class RollNumberGenerator {

    public String extractDegreePrefix(String program) {
        String normalized = program.toUpperCase();

        // Check for IM.Tech / Integrated Master of Technology
        if (normalized.contains("IM.TECH") || normalized.contains("IMTECH") || 
            normalized.contains("INTEGRATED MASTER OF TECHNOLOGY")) {
            return "IM";
        }

        // Check for M.Tech / Master of Technology
        if (normalized.contains("M.TECH") || normalized.contains("MASTER OF TECHNOLOGY")) {
            return "MT";
        }

        // Check for B.Tech / Bachelor of Technology
        if (normalized.contains("B.TECH") || normalized.contains("BACHELOR OF TECHNOLOGY")) {
            return "BT";
        }

        // Check for M.Sc / Master of Science
        if (normalized.startsWith("MS") || normalized.contains("M.SC") || 
            normalized.contains("MASTER OF SCIENCE")) {
            return "MS";
        }

        // Check for Ph.D / Doctor of Philosophy
        if (normalized.contains("PH.D") || normalized.contains("PHD") || 
            normalized.contains("DOCTOR OF PHILOSOPHY")) {
            return "PH";
        }

        // Check for Diploma
        if (normalized.contains("DIPLOMA")) {
            return "DP";
        }

        // Fallback: Use "RN" (Roll Number) prefix for unrecognized degree types
        return "RN";
    }

    public DepartmentRange resolveDepartmentRange(String program) {
        String normalized = program.toUpperCase();

        if (normalized.contains("CSE")) {
            return new DepartmentRange(1, 200);
        }
        if (normalized.contains("ECE")) {
            return new DepartmentRange(501, 600);
        }
        if (normalized.contains("AIDS")) {
            return new DepartmentRange(701, 800);
        }

        // Fallback: Use default range (900-999) for unrecognized departments
        return new DepartmentRange(900, 999);
    }

    public String buildRollBase(String prefix, Integer joinYear) {
        return prefix + String.format("%04d", joinYear);
    }

    public String formatRollNumber(String prefix, Integer joinYear, Integer sequence) {
        String rollBase = buildRollBase(prefix, joinYear);
        String seq = String.format("%03d", sequence);
        return rollBase + seq;
    }

    public record DepartmentRange(int startInclusive, int endInclusive) {}
}
