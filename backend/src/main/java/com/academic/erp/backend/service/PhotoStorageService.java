package com.academic.erp.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Service for storing student photographs on the filesystem.
 * Photos are stored as files on disk, NOT as BLOBs in the database.
 * Only the file path is stored in the database.
 */
@Service
public class PhotoStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private final String uploadRoot;

    public PhotoStorageService(@Value("${app.upload-dir:uploads}") String uploadRoot) {
        this.uploadRoot = uploadRoot;
    }

    /**
     * Stores a photo file on the filesystem and returns the public path.
     * The file is saved to {uploadRoot}/photos/ directory with a UUID filename.
     * 
     * @param file The multipart file to store
     * @return The public path to the stored file (e.g., "/uploads/photos/uuid.jpg")
     * @throws IllegalArgumentException if file is invalid or type is not allowed
     * @throws RuntimeException if file storage fails
     */
    public String storePhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Photo file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || ALLOWED_TYPES.stream().noneMatch(contentType::equalsIgnoreCase)) {
            throw new IllegalArgumentException("Only image files (jpeg/png/gif/webp) are allowed");
        }

        try {
            Path photoDirectory = Paths.get(uploadRoot, "photos")
                    .toAbsolutePath()
                    .normalize();
            Files.createDirectories(photoDirectory);

            String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String sanitizedExtension = (extension != null && !extension.isBlank())
                    ? "." + extension.toLowerCase()
                    : "";
            String filename = UUID.randomUUID() + sanitizedExtension;

            Path target = photoDirectory.resolve(filename);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            Path publicPath = Paths.get("uploads", "photos", filename);
            return "/" + publicPath.toString().replace("\\", "/");
        } catch (IOException ex) {
            throw new RuntimeException("Unable to store photo file", ex);
        }
    }
}

