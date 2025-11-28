package com.academic.erp.backend.controller;

import com.academic.erp.backend.config.DatabaseInitializationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Health & System", description = "System health check and database initialization endpoints (Public)")
public class HealthController {

    private final DatabaseInitializationService databaseInitializationService;

    @Operation(summary = "Health check", description = "Check if the backend service is running (Public endpoint)")
    @ApiResponse(responseCode = "200", description = "Service is healthy")
    @GetMapping("/api/health")
    public String health() {
        return "Backend Working ✔️";
    }

    @Operation(summary = "Test endpoint", description = "Get system status and timestamp (Public endpoint)")
    @ApiResponse(responseCode = "200", description = "System information retrieved")
    @GetMapping("/api/test")
    public Map<String, Object> test() {
        return Map.of(
                "status", "UP",
                "message", "Spring Boot Backend is Running",
                "timestamp", LocalDateTime.now().toString()
        );
    }

    @Operation(summary = "Initialize database", description = "Create missing database tables on demand (Public endpoint - Development only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Database tables created successfully"),
            @ApiResponse(responseCode = "500", description = "Failed to create tables")
    })
    @PostMapping("/api/database/init")
    public ResponseEntity<Map<String, Object>> initializeDatabase() {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean success = databaseInitializationService.createMissingTablesOnDemand();
            if (success) {
                response.put("status", "success");
                response.put("message", "Database tables created successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "Failed to create some tables. Please check logs.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Error creating tables: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

}
