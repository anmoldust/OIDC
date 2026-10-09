package com.oidcdemo.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Public endpoints (no authentication required).
 */
@RestController
@RequestMapping("/api/v1/public")
@Tag(name = "Public", description = "Publicly accessible endpoints")
public class PublicController {

    @GetMapping("/health")
    @Operation(summary = "Simple health check")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "oidc-backend");
    }

    @GetMapping("/info")
    @Operation(summary = "Application info")
    public Map<String, Object> info() {
        return Map.of(
            "name", "OIDC Demo API",
            "version", "1.0.0",
            "description", "Production-grade Spring Boot + Keycloak OIDC"
        );
    }
}
