package com.academic.erp.backend.controller;

import com.academic.erp.backend.dto.StudentResponseDto;
import com.academic.erp.backend.dto.StudentUpdateRequestDto;
import com.academic.erp.backend.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "Student Management", description = "APIs for managing student records")
@SecurityRequirement(name = "bearer-jwt")
public class StudentController {

    private final StudentService studentService;

    @Operation(summary = "Get student by ID", description = "Retrieve a specific student by their ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Student found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = StudentResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @GetMapping("/{studentId}")
    public StudentResponseDto getStudentById(
            @Parameter(description = "Student ID", required = true) @PathVariable Long studentId) {
        return studentService.getStudentById(studentId);
    }

    @Operation(summary = "Update a student", description = "Update student information. Exam marks must meet the domain's cutoff requirement.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Student updated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = StudentResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Student not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input data or exam marks below domain cutoff")
    })
    @PatchMapping("/{studentId}")
    public StudentResponseDto updateStudent(
            @Parameter(description = "Student ID", required = true) @PathVariable Long studentId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Student update request", required = true)
            @Valid @RequestBody StudentUpdateRequestDto request) {
        // Validate that path studentId matches request body studentId
        if (!studentId.equals(request.getStudentId())) {
            throw new IllegalArgumentException("Path studentId (" + studentId + ") does not match request body studentId (" + request.getStudentId() + ")");
        }
        return studentService.updateStudent(studentId, request);
    }

    @Operation(summary = "Delete a student", description = "Delete a student by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Student deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @DeleteMapping("/{studentId}")
    public ResponseEntity<Void> deleteStudent(
            @Parameter(description = "Student ID", required = true) @PathVariable Long studentId) {
        studentService.deleteStudent(studentId);
        return ResponseEntity.noContent().build();
    }
}

