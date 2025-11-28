package com.academic.erp.backend.controller;

import com.academic.erp.backend.dto.PhotoUploadResponse;
import com.academic.erp.backend.service.PhotoStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "Photo Upload", description = "APIs for uploading student photos")
@SecurityRequirement(name = "bearer-jwt")
@Slf4j
public class PhotoUploadController {

    private final PhotoStorageService photoStorageService;

    @Operation(summary = "Upload student photo", description = "Upload a photo file for a student. Supported formats: JPEG, PNG, GIF, WebP")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Photo uploaded successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = PhotoUploadResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid file format or file missing")
    })
    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PhotoUploadResponse uploadPhoto(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Photo file is required");
        }
        
        try {
            String path = photoStorageService.storePhoto(file);
            return new PhotoUploadResponse(path, file.getOriginalFilename(), file.getSize());
        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is
            throw e;
        } catch (Exception e) {
            log.error("Error uploading photo", e);
            throw new RuntimeException("Failed to upload photo: " + e.getMessage());
        }
    }
}

