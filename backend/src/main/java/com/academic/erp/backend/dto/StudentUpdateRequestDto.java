package com.academic.erp.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request DTO for updating student information")
public class StudentUpdateRequestDto {

    @Schema(description = "Student ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Student ID is required")
    private Long studentId;

    @Schema(description = "Student's first name", example = "John", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "First name is required")
    private String firstName;

    @Schema(description = "Student's last name", example = "Doe", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Last name is required")
    private String lastName;

    @Schema(description = "Student's email address", example = "john.doe@student.university.edu", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Schema(description = "ID of the domain", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Domain ID is required")
    private Long domainId;

    @Schema(description = "Year when the student joined", example = "2024", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Join year is required")
    @Min(value = 2000, message = "Join year must be valid")
    @Max(value = 2100, message = "Join year must be valid")
    private Integer joinYear;

    @Schema(description = "Student's exam marks (must meet domain cutoff requirement)", example = "80.50", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Exam marks are required")
    @DecimalMin(value = "0.0", message = "Exam marks must be at least 0")
    @DecimalMax(value = "100.0", message = "Exam marks must be at most 100")
    private Double examMarks;
}

