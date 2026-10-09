package com.oidcdemo.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

/**
 * Standard API error response payload.
 */
@Schema(description = "API error response")
public record ApiError(
    @Schema(description = "HTTP status code", example = "404") int status,
    @Schema(description = "Error type", example = "Not Found") String error,
    @Schema(description = "Human-readable error message") String message,
    @Schema(description = "Request path") String path,
    @Schema(description = "Timestamp of the error") Instant timestamp
) {}
