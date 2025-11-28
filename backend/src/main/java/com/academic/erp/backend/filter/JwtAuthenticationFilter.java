package com.academic.erp.backend.filter;

import com.academic.erp.backend.dto.TokenInfoResponse;
import com.academic.erp.backend.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenService tokenService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String idToken = extractIdTokenFromCookie(request);

        if (idToken != null && !idToken.isEmpty()) {
            try {
                TokenInfoResponse tokenInfo = tokenService.validateIdToken(idToken);
                
                if (tokenInfo.getEmail() != null) {
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                        
                    // Grant admin role if email contains "admin" or "university.edu"
                    if (tokenInfo.getEmail().toLowerCase().contains("admin") || 
                        tokenInfo.getEmail().toLowerCase().contains("university.edu")) {
                            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                        log.info("Admin user authenticated: {}", tokenInfo.getEmail());
                        }
                        
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                tokenInfo.getEmail(),
                                null,
                                authorities
                            );
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                log.error("Token validation failed", e);
                // Don't block here - let Spring Security handle authorization
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractIdTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("id_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}

