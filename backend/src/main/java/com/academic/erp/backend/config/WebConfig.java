package com.academic.erp.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload-dir:uploads}")
    private String uploadRoot;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadRoot).toAbsolutePath().normalize();
        String pathString = uploadPath.toString().replace("\\", "/");
        // Ensure path starts with / for file:// URL
        if (!pathString.startsWith("/")) {
            pathString = "/" + pathString;
        }
        String location = "file://" + pathString + "/";

        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}

