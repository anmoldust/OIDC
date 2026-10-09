package com.oidcdemo.backend.controller;

import com.oidcdemo.backend.dto.UserDto;
import com.oidcdemo.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * User management REST controller.
 *
 * Endpoints:
 *  GET  /api/v1/users/me          — current authenticated user profile
 *  GET  /api/v1/users             — list all users (ADMIN/MANAGER)
 *  GET  /api/v1/users/{id}        — get user by ID (ADMIN/MANAGER)
 *  POST /api/v1/users             — create user (ADMIN)
 *  PUT  /api/v1/users/{id}        — update user (ADMIN)
 *  DELETE /api/v1/users/{id}      — delete user (ADMIN)
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user's profile",
               description = "Provisions the user locally on first call if they don't exist yet.")
    public ResponseEntity<UserDto.Response> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.findOrProvisionUser(jwt));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "List all users (paginated)", description = "Requires ADMIN or MANAGER role.")
    public ResponseEntity<Page<UserDto.Response>> listUsers(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(userService.findAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserDto.Response> getUserById(
            @Parameter(description = "User UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new user", description = "Requires ADMIN role.")
    public ResponseEntity<UserDto.Response> createUser(
            @Valid @RequestBody UserDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and @userSecurity.isSelf(#id, authentication))")
    @Operation(summary = "Update a user", description = "ADMIN can update any user; USER can only update themselves.")
    public ResponseEntity<UserDto.Response> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserDto.UpdateRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a user", description = "Requires ADMIN role.")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
