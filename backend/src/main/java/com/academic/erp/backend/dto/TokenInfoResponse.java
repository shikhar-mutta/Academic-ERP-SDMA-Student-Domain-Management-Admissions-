package com.academic.erp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenInfoResponse {
    private String email;
    private String name;
    private String picture;
    private String aud; // client ID
    private String iss; // issuer
    private Long exp; // expiration
    private Long iat; // issued at
}

