package com.academic.erp.backend.service;

import com.academic.erp.backend.dto.TokenExchangeResponse;
import com.academic.erp.backend.dto.TokenInfoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    private final RestTemplate restTemplate = new RestTemplate();

    public TokenExchangeResponse exchangeCode(String authorizationCode) {
        String tokenEndpoint = "https://oauth2.googleapis.com/token";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", authorizationCode);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    tokenEndpoint, HttpMethod.POST, request, new ParameterizedTypeReference<Map<String, Object>>() {});
            
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new RuntimeException("Failed to exchange authorization code: Invalid response from Google");
            }
            
            Map<String, Object> body = response.getBody();
            
            // Check for error in response
            if (body.containsKey("error")) {
                String errorDescription = (String) body.getOrDefault("error_description", body.get("error"));
                throw new RuntimeException("OAuth error: " + errorDescription);
            }

            String accessToken = (String) body.get("access_token");
            String idToken = (String) body.get("id_token");
            
            if (accessToken == null || idToken == null) {
                throw new RuntimeException("Failed to exchange authorization code: Missing tokens in response");
            }

            return new TokenExchangeResponse(
                    accessToken,
                    (String) body.get("refresh_token"),
                    idToken,
                    (String) body.get("token_type"),
                    body.get("expires_in") != null ? ((Number) body.get("expires_in")).longValue() : null
            );
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("HTTP client error exchanging code: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Authentication failed: Invalid authorization code");
        } catch (org.springframework.web.client.RestClientException e) {
            log.error("REST client error exchanging code", e);
            throw new RuntimeException("Service temporarily unavailable. Please try again.");
        } catch (Exception e) {
            log.error("Error exchanging authorization code", e);
            throw new RuntimeException("Failed to exchange authorization code: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    public TokenInfoResponse validateIdToken(String idToken) {
        String tokenInfoEndpoint = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    tokenInfoEndpoint, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new RuntimeException("Invalid ID token");
            }
            
            Map<String, Object> body = response.getBody();
            
            // Check for error in response
            if (body.containsKey("error")) {
                String errorDescription = (String) body.getOrDefault("error_description", body.get("error"));
                throw new RuntimeException("Token validation error: " + errorDescription);
            }
                
            // Validate client ID
            String aud = (String) body.get("aud");
            if (aud == null || !clientId.equals(aud)) {
                throw new RuntimeException("Invalid client ID in token");
            }

            // Validate issuer
            String iss = (String) body.get("iss");
            if (iss == null || (!iss.equals("https://accounts.google.com") && !iss.equals("accounts.google.com"))) {
                throw new RuntimeException("Invalid issuer in token");
            }

            // Check expiration
            Object expObj = body.get("exp");
            if (expObj != null) {
                long exp = expObj instanceof Number ? ((Number) expObj).longValue() : Long.parseLong(expObj.toString());
                if (exp * 1000 < System.currentTimeMillis()) {
                    throw new RuntimeException("Token has expired");
                }
            }

            // Build response
            TokenInfoResponse tokenInfo = new TokenInfoResponse();
            tokenInfo.setEmail((String) body.get("email"));
            tokenInfo.setName((String) body.get("name"));
            tokenInfo.setPicture((String) body.get("picture"));
            tokenInfo.setAud(aud);
            tokenInfo.setIss(iss);
            if (expObj != null) {
                tokenInfo.setExp(expObj instanceof Number ? ((Number) expObj).longValue() : Long.parseLong(expObj.toString()));
            }
            Object iatObj = body.get("iat");
            if (iatObj != null) {
                tokenInfo.setIat(iatObj instanceof Number ? ((Number) iatObj).longValue() : Long.parseLong(iatObj.toString()));
            }

            return tokenInfo;
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("HTTP client error validating token: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Invalid or expired token");
        } catch (org.springframework.web.client.RestClientException e) {
            log.error("REST client error validating token", e);
            throw new RuntimeException("Service temporarily unavailable. Please try again.");
        } catch (Exception e) {
            log.error("Error validating ID token", e);
            throw new RuntimeException("Failed to validate ID token: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

}

