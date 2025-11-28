package com.academic.erp.backend.service;

import com.academic.erp.backend.dto.StudentResponseDto;
import com.academic.erp.backend.dto.StudentUpdateRequestDto;

public interface StudentService {
    StudentResponseDto updateStudent(Long studentId, StudentUpdateRequestDto request);
    void deleteStudent(Long studentId);
    StudentResponseDto getStudentById(Long studentId);
}

