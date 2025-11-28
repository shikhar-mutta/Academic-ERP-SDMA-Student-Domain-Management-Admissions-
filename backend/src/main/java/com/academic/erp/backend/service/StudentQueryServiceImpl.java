package com.academic.erp.backend.service;

import com.academic.erp.backend.dto.StudentResponseDto;
import com.academic.erp.backend.entity.Student;
import com.academic.erp.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentQueryServiceImpl implements StudentQueryService {

    private final StudentRepository studentRepository;

    private StudentResponseDto toDto(Student s) {
        return StudentResponseDto.builder()
                .studentId(s.getStudentId())
                .rollNumber(s.getRollNumber())
                .firstName(s.getFirstName())
                .lastName(s.getLastName())
                .email(s.getEmail())
                .domainId(s.getDomain().getDomainId())
                .domainProgram(s.getDomain().getProgram())
                .joinYear(s.getJoinYear())
                .examMarks(s.getExamMarks())
                .build();
    }

    @Override
    public List<StudentResponseDto> getStudentsByDomain(Long domainId) {
        return studentRepository.findByDomain_DomainIdAndIsActiveTrue(domainId)
                .stream()
                .map(this::toDto)
                .toList();
    }
}
