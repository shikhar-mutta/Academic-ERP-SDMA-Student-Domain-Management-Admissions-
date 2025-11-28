package com.academic.erp.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response DTO for domain information")
public class DomainResponseDto {

    @Schema(description = "Unique domain ID", example = "1")
    private Long domainId;
    
    @Schema(description = "Program name", example = "Bachelor of Technology in CSE")
    private String program;
    
    @Schema(description = "Batch year", example = "2024")
    private String batch;
    
    @Schema(description = "Maximum capacity", example = "60")
    private Integer capacity;
    
    @Schema(description = "Exam name for qualification", example = "JEE Main")
    private String examName;
    
    @Schema(description = "Cutoff marks required", example = "75.00")
    private Double cutoffMarks;
    
    @Schema(description = "Number of active students in this domain", example = "25")
    private Long studentCount;
}
