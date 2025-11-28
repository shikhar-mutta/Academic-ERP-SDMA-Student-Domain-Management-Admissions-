package com.academic.erp.backend.controller;

import com.academic.erp.backend.dto.TokenExchangeResponse;
import com.academic.erp.backend.dto.TokenInfoResponse;
import com.academic.erp.backend.service.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "OAuth2 authentication endpoints (Public)")
@Slf4j
public class OAuthController {

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    private final TokenService tokenService;

    @Operation(summary = "Login with Google OAuth2", description = "Redirects to Google OAuth2 login page (Public endpoint)")
    @ApiResponse(responseCode = "302", description = "Redirect to Google OAuth2")
    @GetMapping("/login")
    public RedirectView login() {
        String scope = "openid email profile";
        String authUrl = String.format(
                "https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=%s&access_type=offline&prompt=consent",
                URLEncoder.encode(clientId, StandardCharsets.UTF_8),
                URLEncoder.encode(redirectUri, StandardCharsets.UTF_8),
                URLEncoder.encode(scope, StandardCharsets.UTF_8)
        );
        return new RedirectView(authUrl);
    }

    @Operation(summary = "OAuth2 callback", description = "Handles OAuth2 callback from Google and redirects to frontend (Public endpoint)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "302", description = "Redirect to frontend after authentication"),
            @ApiResponse(responseCode = "302", description = "Redirect to frontend with error")
    })
    @GetMapping("/oauth2/callback")
    public RedirectView callback(
            @Parameter(description = "Authorization code from Google") @RequestParam(value = "code", required = false) String code,
            @Parameter(description = "Error message from OAuth provider") @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        if (error != null) {
            log.error("OAuth error: {}", error);
            return new RedirectView("http://localhost:5173?error=" + URLEncoder.encode(error, StandardCharsets.UTF_8));
        }

        if (code == null) {
            log.error("No authorization code received");
            return new RedirectView("http://localhost:5173?error=no_code");
        }

        try {
            // Exchange authorization code for tokens
            TokenExchangeResponse tokenResponse = tokenService.exchangeCode(code);

            // Validate ID token and get user info
            TokenInfoResponse tokenInfo = tokenService.validateIdToken(tokenResponse.getIdToken());

            // Store access token and refresh token in session
            HttpSession session = request.getSession(true);
            session.setAttribute("access_token", tokenResponse.getAccessToken());
            if (tokenResponse.getRefreshToken() != null) {
                session.setAttribute("refresh_token", tokenResponse.getRefreshToken());
            }

            // Set ID token in HTTP-only cookie (allow login for all emails)
            Cookie idTokenCookie = new Cookie("id_token", tokenResponse.getIdToken());
            idTokenCookie.setHttpOnly(true);
            idTokenCookie.setSecure(false); // Set to true in production with HTTPS
            idTokenCookie.setPath("/");
            idTokenCookie.setMaxAge(3600); // 1 hour
            response.addCookie(idTokenCookie);

            // Allow all authenticated users to access the system
            // Redirect to domains list page
            log.info("User authenticated: {}", tokenInfo.getEmail());
            return new RedirectView("http://localhost:5173/domains-list");

        } catch (Exception e) {
            log.error("Error during OAuth callback", e);
            return new RedirectView("http://localhost:5173?error=" + 
                URLEncoder.encode("Authentication failed", StandardCharsets.UTF_8));
        }
    }

    @Operation(summary = "Sign out", description = "Sign out the current user and clear session (Public endpoint)")
    @ApiResponse(responseCode = "200", description = "Successfully signed out")
    @PostMapping("/signout")
    public ResponseEntity<Void> signout(HttpServletRequest request, HttpServletResponse response) {
        // Clear session
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // Delete ID token cookie
        Cookie idTokenCookie = new Cookie("id_token", "");
        idTokenCookie.setHttpOnly(true);
        idTokenCookie.setSecure(false);
        idTokenCookie.setPath("/");
        idTokenCookie.setMaxAge(0);
        response.addCookie(idTokenCookie);

        // Clear security context
        org.springframework.security.core.context.SecurityContextHolder.clearContext();

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get current user", description = "Get the currently authenticated user information from ID token (Public endpoint)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User information retrieved"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @GetMapping("/api/auth/me")
    public ResponseEntity<TokenInfoResponse> getCurrentUser(HttpServletRequest request) {
        String idToken = extractIdTokenFromCookie(request);

        if (idToken != null) {
            try {
                TokenInfoResponse tokenInfo = tokenService.validateIdToken(idToken);
                return ResponseEntity.ok(tokenInfo);
            } catch (Exception e) {
                log.error("Error getting current user", e);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    private String extractIdTokenFromCookie(HttpServletRequest request) {
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("id_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}

