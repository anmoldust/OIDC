package com.oidcdemo.backend.service;

import com.oidcdemo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Spring Security expression component for fine-grained access control.
 * Used in @PreAuthorize SpEL expressions to check resource ownership.
 *
 * Example usage:
 *   @PreAuthorize("hasRole('ADMIN') or @userSecurity.isSelf(#id, authentication)")
 */
@Component("userSecurity")
@RequiredArgsConstructor
public class UserSecurityService {

    private final UserRepository userRepository;

    /**
     * Returns true if the authenticated user's local UUID matches the given id.
     */
    public boolean isSelf(UUID id, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return false;
        }
        String keycloakId = jwt.getSubject();
        return userRepository.findById(id)
            .map(user -> user.getKeycloakId().equals(keycloakId))
            .orElse(false);
    }
}
