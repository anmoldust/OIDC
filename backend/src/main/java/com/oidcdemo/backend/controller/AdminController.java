package com.oidcdemo.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Admin-only endpoints demonstrating RBAC enforcement.
 */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin-only endpoints (ROLE_ADMIN required)")
public class AdminController {

    @GetMapping("/dashboard")
    @Operation(summary = "Admin dashboard stats")
    public Map<String, Object> dashboard(@AuthenticationPrincipal Jwt jwt) {
        return Map.of(
            "adminUser", jwt.getClaimAsString("preferred_username"),
            "message", "Welcome to the Admin Dashboard",
            "stats", Map.of(
                "totalUsers", 0,
                "activeUsers", 0,
                "pendingApprovals", 0
            )
        );
    }

    @GetMapping("/audit-log")
    @Operation(summary = "View audit log entries")
    public List<Map<String, Object>> auditLog() {
        // In production, query an audit_log table
        return List.of(
            Map.of("event", "USER_LOGIN", "timestamp", "2026-09-28T06:00:00Z", "user", "john@example.com"),
            Map.of("event", "USER_CREATED", "timestamp", "2026-09-28T05:00:00Z", "user", "jane@example.com")
        );
    }
}
