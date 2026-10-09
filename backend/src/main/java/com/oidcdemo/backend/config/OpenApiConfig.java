package com.oidcdemo.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.Scopes;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI / Swagger UI configuration with Keycloak OAuth2 security scheme.
 * Accessible at: http://localhost:8080/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    @Value("${keycloak.auth-server-url:http://localhost:8180}")
    private String keycloakUrl;

    @Value("${keycloak.realm:oidc-demo}")
    private String realm;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "keycloak_oauth2";
        String authUrl = keycloakUrl + "/realms/" + realm + "/protocol/openid-connect";

        return new OpenAPI()
            .info(new Info()
                .title("OIDC Demo API")
                .description("""
                    Production-grade REST API secured with Keycloak OIDC.
                    
                    ## Authentication
                    This API uses **OAuth2 / OpenID Connect** with Keycloak as the identity provider.
                    Use the **Authorize** button to obtain a token via the Authorization Code flow.
                    
                    ## Roles
                    - `ROLE_USER` — read access
                    - `ROLE_MANAGER` — read + write access
                    - `ROLE_ADMIN` — full access including admin endpoints
                    """)
                .version("1.0.0")
                .contact(new Contact()
                    .name("OIDC Demo Team")
                    .email("team@oidcdemo.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0")))
            .servers(List.of(
                new Server().url("http://localhost:8080").description("Local Development"),
                new Server().url("https://api.oidcdemo.com").description("Production")
            ))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                    .type(SecurityScheme.Type.OAUTH2)
                    .description("Keycloak OAuth2 Authorization Code Flow")
                    .flows(new OAuthFlows()
                        .authorizationCode(new OAuthFlow()
                            .authorizationUrl(authUrl + "/auth")
                            .tokenUrl(authUrl + "/token")
                            .refreshUrl(authUrl + "/token")
                            .scopes(new Scopes()
                                .addString("openid", "OpenID Connect scope")
                                .addString("profile", "User profile information")
                                .addString("email", "User email address")
                                .addString("roles", "User roles")
                            )
                        )
                    )
                )
            );
    }
}
