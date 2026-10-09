package com.oidcdemo.backend.dto;

import com.oidcdemo.backend.model.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

/**
 * Data Transfer Objects for User operations.
 * Uses Java records for immutability and conciseness.
 */
public sealed interface UserDto permits UserDto.Response, UserDto.CreateRequest, UserDto.UpdateRequest {

    @Schema(description = "User response payload")
    record Response(
        @Schema(description = "Internal user UUID") UUID id,
        @Schema(description = "Keycloak subject ID") String keycloakId,
        @Schema(description = "User email address") String email,
        @Schema(description = "First name") String firstName,
        @Schema(description = "Last name") String lastName,
        @Schema(description = "Account status") User.UserStatus status,
        @Schema(description = "Account creation timestamp") Instant createdAt,
        @Schema(description = "Last updated timestamp") Instant updatedAt
    ) implements UserDto {}

    @Schema(description = "Create user request")
    record CreateRequest(
        @NotBlank @Schema(description = "Keycloak subject claim (sub)") String keycloakId,
        @NotBlank @Email @Schema(description = "Email address") String email,
        @NotBlank @Size(max = 100) @Schema(description = "First name") String firstName,
        @NotBlank @Size(max = 100) @Schema(description = "Last name") String lastName
    ) implements UserDto {}

    @Schema(description = "Update user request")
    record UpdateRequest(
        @Size(max = 100) @Schema(description = "First name") String firstName,
        @Size(max = 100) @Schema(description = "Last name") String lastName,
        @Schema(description = "Account status") User.UserStatus status
    ) implements UserDto {}
}
