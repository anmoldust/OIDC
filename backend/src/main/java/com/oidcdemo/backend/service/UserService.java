package com.oidcdemo.backend.service;

import com.oidcdemo.backend.dto.UserDto;
import com.oidcdemo.backend.exception.ConflictException;
import com.oidcdemo.backend.exception.ResourceNotFoundException;
import com.oidcdemo.backend.mapper.UserMapper;
import com.oidcdemo.backend.model.User;
import com.oidcdemo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Business logic for User management.
 * Keycloak is the authority for authentication; this service manages
 * application-specific user profile data persisted in PostgreSQL.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /**
     * Find or create a local user record from a Keycloak JWT.
     * Called on first login to provision the user locally.
     */
    @Transactional
    public UserDto.Response findOrProvisionUser(Jwt jwt) {
        String keycloakId = jwt.getSubject();
        return userRepository.findByKeycloakId(keycloakId)
            .map(userMapper::toResponse)
            .orElseGet(() -> {
                log.info("Provisioning new local user for Keycloak ID: {}", keycloakId);
                User newUser = User.builder()
                    .keycloakId(keycloakId)
                    .email(jwt.getClaimAsString("email"))
                    .firstName(jwt.getClaimAsString("given_name"))
                    .lastName(jwt.getClaimAsString("family_name"))
                    .build();
                return userMapper.toResponse(userRepository.save(newUser));
            });
    }

    public Page<UserDto.Response> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toResponse);
    }

    public UserDto.Response findById(UUID id) {
        return userRepository.findById(id)
            .map(userMapper::toResponse)
            .orElseThrow(() -> ResourceNotFoundException.ofId("User", id));
    }

    public UserDto.Response findByKeycloakId(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId)
            .map(userMapper::toResponse)
            .orElseThrow(() -> ResourceNotFoundException.ofId("User", keycloakId));
    }

    @Transactional
    public UserDto.Response create(UserDto.CreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered: " + request.email());
        }
        if (userRepository.existsByKeycloakId(request.keycloakId())) {
            throw new ConflictException("Keycloak ID already registered: " + request.keycloakId());
        }
        User user = userMapper.toEntity(request);
        User saved = userRepository.save(user);
        log.info("Created user {} with ID {}", saved.getEmail(), saved.getId());
        return userMapper.toResponse(saved);
    }

    @Transactional
    public UserDto.Response update(UUID id, UserDto.UpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> ResourceNotFoundException.ofId("User", id));
        userMapper.updateEntityFromRequest(request, user);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void delete(UUID id) {
        if (!userRepository.existsById(id)) {
            throw ResourceNotFoundException.ofId("User", id);
        }
        userRepository.deleteById(id);
        log.info("Deleted user with ID {}", id);
    }
}
