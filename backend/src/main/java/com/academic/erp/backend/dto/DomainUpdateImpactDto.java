package com.academic.erp.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response DTO showing the impact of updating a domain")
public class DomainUpdateImpactDto {
    @Schema(description = "Domain ID", example = "1")
    private Long domainId;
    
    @Schema(description = "Number of students that would be affected/removed", example = "5")
    private Long affectedStudentsCount;
    
    @Schema(description = "Impact message", example = "5 students will be removed if cutoff marks are increased to 80.00")
    private String message;
}

