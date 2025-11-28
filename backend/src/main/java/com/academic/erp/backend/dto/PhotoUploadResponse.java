package com.academic.erp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PhotoUploadResponse {
    private String path;
    private String originalName;
    private long size;
}

