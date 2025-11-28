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
import java.util.Set;
import java.util.stream.Collectors;

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

        // 9) After saving, check if capacity is exceeded and adjust active status
        // Fetch all students in this domain
        List<Student> allDomainStudents = studentRepository.findByDomain_DomainId(domain.getDomainId());
        
        // Only proceed if domain has a capacity set
        if (domain.getCapacity() != null && domain.getCapacity() > 0) {
            // Filter students who cleared the cutoff
            List<Student> eligibleStudents = allDomainStudents.stream()
                    .filter(s -> {
                        // Student must have exam marks
                        if (s.getExamMarks() == null) {
                            return false;
                        }
                        // If domain has cutoff, student must meet it
                        if (domain.getCutoffMarks() != null) {
                            return s.getExamMarks() >= domain.getCutoffMarks();
                        }
                        // If no cutoff, all students with marks are eligible
                        return true;
                    })
                    .toList();
            
            // If number of eligible students exceeds capacity, prioritize by marks
            if (eligibleStudents.size() > domain.getCapacity()) {
                // Sort eligible students: first by exam marks (descending), then by name (ascending)
                List<Student> sortedEligible = eligibleStudents.stream()
                        .sorted((s1, s2) -> {
                            // Compare by exam marks (descending - higher marks first)
                            int marksCompare = Double.compare(
                                s2.getExamMarks() != null ? s2.getExamMarks() : 0.0,
                                s1.getExamMarks() != null ? s1.getExamMarks() : 0.0
                            );
                            if (marksCompare != 0) {
                                return marksCompare;
                            }
                            // If marks are equal, compare by name (alphabetical - ascending)
                            String name1 = (s1.getFirstName() != null ? s1.getFirstName() : "") + 
                                         (s1.getLastName() != null ? s1.getLastName() : "");
                            String name2 = (s2.getFirstName() != null ? s2.getFirstName() : "") + 
                                         (s2.getLastName() != null ? s2.getLastName() : "");
                            return name1.compareToIgnoreCase(name2);
                        })
                        .toList();
                
                // Create a set of eligible student IDs for quick lookup
                Set<Long> eligibleStudentIds = eligibleStudents.stream()
                        .map(Student::getStudentId)
                        .collect(Collectors.toSet());
                
                // Activate top N students (where N = capacity)
                int activeCount = 0;
                for (Student eligibleStudent : sortedEligible) {
                    if (activeCount < domain.getCapacity()) {
                        eligibleStudent.setIsActive(true);
                        activeCount++;
                    } else {
                        eligibleStudent.setIsActive(false);
                    }
                }
                
                // Deactivate all students who didn't meet cutoff
                for (Student domainStudent : allDomainStudents) {
                    if (!eligibleStudentIds.contains(domainStudent.getStudentId())) {
                        domainStudent.setIsActive(false);
                    }
                }
                
                // Save all updated students
                studentRepository.saveAll(allDomainStudents);
            } else {
                // If capacity is not exceeded, activate all eligible students and deactivate others
                Set<Long> eligibleStudentIds = eligibleStudents.stream()
                        .map(Student::getStudentId)
                        .collect(Collectors.toSet());
                
                for (Student domainStudent : allDomainStudents) {
                    if (eligibleStudentIds.contains(domainStudent.getStudentId())) {
                        domainStudent.setIsActive(true);
                    } else {
                        domainStudent.setIsActive(false);
                    }
                }
                studentRepository.saveAll(allDomainStudents);
            }
        }

        // 10) Return response
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
