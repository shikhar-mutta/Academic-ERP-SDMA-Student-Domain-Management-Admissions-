package com.academic.erp.backend.service;

import com.academic.erp.backend.dto.StudentAdmissionRequestDto;
import com.academic.erp.backend.dto.StudentResponseDto;

public interface AdmissionService {
    StudentResponseDto admitStudent(StudentAdmissionRequestDto request);
}
