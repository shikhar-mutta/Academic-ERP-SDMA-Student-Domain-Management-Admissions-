package com.academic.erp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenExchangeResponse {
    private String accessToken;
    private String refreshToken;
    private String idToken;
    private String tokenType;
    private Long expiresIn;
}

