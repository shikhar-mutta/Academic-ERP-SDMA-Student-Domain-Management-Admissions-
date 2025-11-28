package com.academic.erp.backend.service;

import com.academic.erp.backend.dto.StudentResponseDto;
import java.util.List;

public interface StudentQueryService {
    List<StudentResponseDto> getAllStudents();
    List<StudentResponseDto> getStudentsByDomain(Long domainId);
}
