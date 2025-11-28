package com.academic.erp.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response DTO for student information")
public class StudentResponseDto {

    @Schema(description = "Unique student ID", example = "1")
    private Long studentId;
    
    @Schema(description = "Auto-generated roll number", example = "BT2024001")
    private String rollNumber;
    
    @Schema(description = "Student's first name", example = "John")
    private String firstName;
    
    @Schema(description = "Student's last name", example = "Doe")
    private String lastName;
    
    @Schema(description = "Student's email address", example = "john.doe@student.university.edu")
    private String email;
    
    @Schema(description = "Domain ID", example = "1")
    private Long domainId;
    
    @Schema(description = "Domain program name", example = "Bachelor of Technology in CSE")
    private String domainProgram;
    
    @Schema(description = "Year when student joined", example = "2024")
    private Integer joinYear;
    
    @Schema(description = "Student's exam marks", example = "80.50")
    private Double examMarks;
}
