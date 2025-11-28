package com.academic.erp.backend.service;

import com.academic.erp.backend.dto.StudentAdmissionRequestDto;
import com.academic.erp.backend.dto.StudentResponseDto;
import com.academic.erp.backend.entity.Domain;
import com.academic.erp.backend.entity.Student;
import com.academic.erp.backend.repository.DomainRepository;
import com.academic.erp.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdmissionServiceImpl implements AdmissionService {

    private final DomainRepository domainRepository;
    private final StudentRepository studentRepository;
    private final RollNumberGenerator rollNumberGenerator;

    @Override
    @Transactional
    public StudentResponseDto admitStudent(StudentAdmissionRequestDto request) {

        // 1) Validate domain
        Domain domain = domainRepository.findById(request.getDomainId())
                .orElseThrow(() -> new RuntimeException("Invalid domain ID"));

        // 2) Resolve degree prefix & department range
        String prefix = rollNumberGenerator.extractDegreePrefix(domain.getProgram());
        RollNumberGenerator.DepartmentRange range = rollNumberGenerator.resolveDepartmentRange(domain.getProgram());

        // 3) Fetch existing roll numbers for this join year and prefix
        String rollBase = rollNumberGenerator.buildRollBase(prefix, request.getJoinYear());
        List<Student> existingStudents = studentRepository
                .findByRollNumberStartingWithAndJoinYear(rollBase, request.getJoinYear());

        // 4) Extract sequence numbers from existing roll numbers and find the max
        int lastSeq = range.startInclusive() - 1;
        for (Student student : existingStudents) {
            String rollNum = student.getRollNumber();
            if (rollNum != null && rollNum.startsWith(rollBase) && rollNum.length() >= rollBase.length() + 3) {
                try {
                    String seqStr = rollNum.substring(rollBase.length());
                    int seq = Integer.parseInt(seqStr);
                    if (seq >= range.startInclusive() && seq <= range.endInclusive() && seq > lastSeq) {
                        lastSeq = seq;
                    }
                } catch (NumberFormatException e) {
                    // Skip invalid roll numbers
                }
            }
        }

        int newSeq = lastSeq + 1;
        if (newSeq > range.endInclusive()) {
            throw new RuntimeException("Seat range exhausted for department: " + domain.getProgram());
        }

        // 5) Generate roll number
        String rollNumber = rollNumberGenerator.formatRollNumber(
                prefix,
                request.getJoinYear(),
                newSeq
        );

        // 6) Determine isActive based on exam marks vs cutoff for this particular domain
        // If marks < cutoff for this domain, set isActive = false (disabled)
        // Allow admission even if marks are below cutoff, but student will be inactive
        Boolean isActive = true;
        if (domain.getCutoffMarks() != null && request.getExamMarks() != null) {
            // Only disable if marks are less than cutoff for this specific domain
            isActive = request.getExamMarks() >= domain.getCutoffMarks();
        }

        // 7) Build student entity
        Student student = Student.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .domain(domain)
                .joinYear(request.getJoinYear())
                .rollNumber(rollNumber)
                .examMarks(request.getExamMarks())
                .isActive(isActive)
                .build();

        // 8) Save
        studentRepository.save(student);

        // 9) Return response
        return StudentResponseDto.builder()
                .studentId(student.getStudentId())
                .rollNumber(student.getRollNumber())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(student.getEmail())
                .domainId(domain.getDomainId())
                .domainProgram(domain.getProgram())
                .joinYear(student.getJoinYear())
                .examMarks(student.getExamMarks())
                .build();
    }
}
