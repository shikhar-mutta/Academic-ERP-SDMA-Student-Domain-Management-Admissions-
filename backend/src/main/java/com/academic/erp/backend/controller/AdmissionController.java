package com.academic.erp.backend.controller;

import com.academic.erp.backend.dto.StudentAdmissionRequestDto;
import com.academic.erp.backend.dto.StudentResponseDto;
import com.academic.erp.backend.service.AdmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "Student Admission", description = "APIs for admitting new students")
@SecurityRequirement(name = "bearer-jwt")
public class AdmissionController {

    private final AdmissionService admissionService;

    @Operation(summary = "Admit a new student", description = "Admit a new student to a domain. Exam marks must meet the domain's cutoff requirement. A roll number will be automatically generated.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Student admitted successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = StudentResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data or exam marks below domain cutoff"),
            @ApiResponse(responseCode = "404", description = "Domain not found")
    })
    @PostMapping("/admit")
    public StudentResponseDto admitStudent(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Student admission request", required = true)
            @Valid @RequestBody StudentAdmissionRequestDto request) {
        return admissionService.admitStudent(request);
    }
}
