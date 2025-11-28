package com.academic.erp.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request DTO for creating or updating a domain")
public class DomainRequestDto {

    @Schema(description = "Program name (e.g., 'Bachelor of Technology in CSE')", example = "Bachelor of Technology in CSE", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Program name is required")
    private String program;

    @Schema(description = "Batch year (e.g., '2024')", example = "2024", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Batch is required")
    @Pattern(regexp = "^(202[0-6])$", message = "Batch must be between 2020 and 2026")
    private String batch;

    @Schema(description = "Maximum capacity of the domain", example = "60", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Capacity is required")
    @Min(value = 0, message = "Capacity must be at least 0")
    @Max(value = 150, message = "Capacity must be at most 150")
    private Integer capacity;

    @Schema(description = "Exam name for qualification (e.g., 'JEE Main', 'GATE')", example = "JEE Main", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Exam name is required")
    private String examName;

    @Schema(description = "Minimum cutoff marks required for admission", example = "75.00", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Cutoff marks is required")
    @DecimalMin(value = "0.0", message = "Cutoff marks must be at least 0")
    @DecimalMax(value = "100.0", message = "Cutoff marks must be at most 100")
    private Double cutoffMarks;
}

