package com.academic.erp.backend.controller;

import com.academic.erp.backend.dto.StudentResponseDto;
import com.academic.erp.backend.service.StudentQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "Student Queries", description = "APIs for querying student records")
@SecurityRequirement(name = "bearer-jwt")
public class StudentQueryController {

    private final StudentQueryService queryService;

    @Operation(summary = "Get all students", description = "Retrieve a list of all students")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of students",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = StudentResponseDto.class)))
    @GetMapping
    public List<StudentResponseDto> getAllStudents() {
        return queryService.getAllStudents();
    }

    @Operation(summary = "Get students by domain", description = "Retrieve all students belonging to a specific domain")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved students for the domain",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = StudentResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Domain not found")
    })
    @GetMapping("/domain/{domainId}")
    public List<StudentResponseDto> getStudentsByDomain(
            @Parameter(description = "Domain ID", required = true) @PathVariable Long domainId) {
        return queryService.getStudentsByDomain(domainId);
    }
}
