package com.oidcdemo.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Production-grade Spring Boot application secured with Keycloak OIDC.
 * Implements both OAuth2 Resource Server (JWT) for API endpoints
 * and OAuth2 Login for server-side authenticated flows.
 */
@SpringBootApplication
public class OidcBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(OidcBackendApplication.class, args);
    }
}
