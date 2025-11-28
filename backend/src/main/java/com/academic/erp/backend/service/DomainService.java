package com.academic.erp.backend.service;

import com.academic.erp.backend.dto.DomainRequestDto;
import com.academic.erp.backend.dto.DomainResponseDto;
import com.academic.erp.backend.dto.DomainUpdateImpactDto;
import java.util.List;

public interface DomainService {
    List<DomainResponseDto> getAllDomains();
    DomainResponseDto createDomain(DomainRequestDto request);
    DomainResponseDto updateDomain(Long domainId, DomainRequestDto request);
    DomainUpdateImpactDto getUpdateImpact(Long domainId, DomainRequestDto request);
    DomainUpdateImpactDto getDeleteImpact(Long domainId);
    void deleteDomain(Long domainId);
    DomainResponseDto getDomainById(Long domainId);
}
