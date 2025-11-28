package com.academic.erp.backend.controller;

import com.academic.erp.backend.dto.DomainRequestDto;
import com.academic.erp.backend.dto.DomainResponseDto;
import com.academic.erp.backend.dto.DomainUpdateImpactDto;
import com.academic.erp.backend.service.DomainService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/domains")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "Domain Management", description = "APIs for managing academic domains/programs")
@SecurityRequirement(name = "bearer-jwt")
public class DomainController {

    private final DomainService domainService;

    @Operation(summary = "Get all domains", description = "Retrieve a list of all academic domains/programs")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of domains",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = DomainResponseDto.class)))
    @GetMapping
    public List<DomainResponseDto> getAllDomains() {
        return domainService.getAllDomains();
    }

    @Operation(summary = "Get domain by ID", description = "Retrieve a specific domain by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Domain found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DomainResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Domain not found")
    })
    @GetMapping("/{domainId}")
    public DomainResponseDto getDomainById(
            @Parameter(description = "Domain ID", required = true) @PathVariable Long domainId) {
        return domainService.getDomainById(domainId);
    }

    @Operation(summary = "Create a new domain", description = "Create a new academic domain/program")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Domain created successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DomainResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping
    public ResponseEntity<DomainResponseDto> createDomain(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Domain creation request", required = true)
            @Valid @RequestBody DomainRequestDto request) {
        DomainResponseDto created = domainService.createDomain(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Get domain update impact", description = "Check the impact of updating a domain (e.g., how many students would be removed if cutoff marks are increased)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Impact calculated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DomainUpdateImpactDto.class))),
            @ApiResponse(responseCode = "404", description = "Domain not found")
    })
    @PostMapping("/{domainId}/impact")
    public ResponseEntity<DomainUpdateImpactDto> getUpdateImpact(
            @Parameter(description = "Domain ID", required = true) @PathVariable Long domainId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Proposed domain update", required = true)
            @Valid @RequestBody DomainRequestDto request) {
        DomainUpdateImpactDto impact = domainService.getUpdateImpact(domainId, request);
        return ResponseEntity.ok(impact);
    }

    @Operation(summary = "Update a domain", description = "Update an existing domain. If cutoff marks are increased, students below the new cutoff will be automatically removed.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Domain updated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DomainResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Domain not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PatchMapping("/{domainId}")
    public DomainResponseDto updateDomain(
            @Parameter(description = "Domain ID", required = true) @PathVariable Long domainId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Domain update request", required = true)
            @Valid @RequestBody DomainRequestDto request) {
        return domainService.updateDomain(domainId, request);
    }

    @Operation(summary = "Get domain delete impact", description = "Check the impact of deleting a domain (e.g., how many students would be deleted)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Impact calculated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DomainUpdateImpactDto.class))),
            @ApiResponse(responseCode = "404", description = "Domain not found")
    })
    @GetMapping("/{domainId}/delete-impact")
    public ResponseEntity<DomainUpdateImpactDto> getDeleteImpact(
            @Parameter(description = "Domain ID", required = true) @PathVariable Long domainId) {
        DomainUpdateImpactDto impact = domainService.getDeleteImpact(domainId);
        return ResponseEntity.ok(impact);
    }

    @Operation(summary = "Delete a domain", description = "Delete a domain by ID. This will also permanently delete all students associated with this domain.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Domain and all associated students deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Domain not found")
    })
    @DeleteMapping("/{domainId}")
    public ResponseEntity<Void> deleteDomain(
            @Parameter(description = "Domain ID", required = true) @PathVariable Long domainId) {
        domainService.deleteDomain(domainId);
        return ResponseEntity.noContent().build();
    }
}
