package com.academic.erp.backend.service;

import com.academic.erp.backend.dto.StudentResponseDto;
import com.academic.erp.backend.dto.StudentUpdateRequestDto;
import com.academic.erp.backend.entity.Domain;
import com.academic.erp.backend.entity.Student;
import com.academic.erp.backend.repository.DomainRepository;
import com.academic.erp.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final DomainRepository domainRepository;

    @Override
    @Transactional
    public StudentResponseDto updateStudent(Long studentId, StudentUpdateRequestDto request) {
        // Fetch the student to update - only this one student will be modified
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        // Always fetch the domain from the request (frontend sends domainId)
        // This ensures we use the correct domain's cutoff marks for comparison
        Domain targetDomain = domainRepository.findById(request.getDomainId())
                    .orElseThrow(() -> new RuntimeException("Domain not found with id: " + request.getDomainId()));

        // Check if domain is being changed
        boolean domainChanged = !student.getDomain().getDomainId().equals(request.getDomainId());
        if (domainChanged) {
            // Update the student's domain reference to the new domain
            student.setDomain(targetDomain);
        } else {
            // Domain not changed, but ensure we have the latest domain data for cutoff check
            student.setDomain(targetDomain);
        }

        // Update ONLY this student's fields - no other students are affected
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setJoinYear(request.getJoinYear());
        student.setExamMarks(request.getExamMarks());

        // Check if exam marks are less than cutoff marks for the domain
        // If marks < cutoff, make student inactive (isActive = false)
        // If marks >= cutoff, make student active (isActive = true)
        boolean shouldBeActive = true;
        if (targetDomain.getCutoffMarks() != null && request.getExamMarks() != null) {
            // Compare exam marks with domain cutoff marks
            // If exam marks are less than cutoff, student should be inactive
            shouldBeActive = request.getExamMarks() >= targetDomain.getCutoffMarks();
        }
        student.setIsActive(shouldBeActive);

        // Save ONLY this student - no other students are affected
        Student updated = studentRepository.save(student);
        return toDto(updated);
    }

    @Override
    @Transactional
    public void deleteStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new RuntimeException("Student not found with id: " + studentId);
        }
        studentRepository.deleteById(studentId);
    }

    @Override
    public StudentResponseDto getStudentById(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        return toDto(student);
    }

    private StudentResponseDto toDto(Student student) {
        return StudentResponseDto.builder()
                .studentId(student.getStudentId())
                .rollNumber(student.getRollNumber())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(student.getEmail())
                .domainId(student.getDomain().getDomainId())
                .domainProgram(student.getDomain().getProgram())
                .joinYear(student.getJoinYear())
                .examMarks(student.getExamMarks())
                .build();
    }
}

