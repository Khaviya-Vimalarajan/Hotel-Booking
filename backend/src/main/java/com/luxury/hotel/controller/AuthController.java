package com.luxury.hotel.controller;

import com.luxury.hotel.dto.AuthResponse;
import com.luxury.hotel.dto.LoginRequest;
import com.luxury.hotel.dto.RefreshRequest;
import com.luxury.hotel.dto.RegisterRequest;
import com.luxury.hotel.entity.Role;
import com.luxury.hotel.entity.User;
import com.luxury.hotel.entity.UserStatus;
import com.luxury.hotel.repository.UserRepository;
import com.luxury.hotel.security.JwtUtils;
import com.luxury.hotel.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Error: Email is already in use!"));
        }

        // Set Role
        Role userRole = Role.CUSTOMER;
        if (registerRequest.getRole() != null) {
            try {
                userRole = Role.valueOf(registerRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("message", "Error: Invalid Role specified!"));
            }
        }

        // Create new user's account
        User user = User.builder()
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .phone(registerRequest.getPhone())
                .role(userRole)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        return new ResponseEntity<>(Map.of("message", "User registered successfully!"), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.debug("Authenticating user: {}", loginRequest.getEmail());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtUtils.generateAccessToken(userDetails.getEmail());
        String refreshJwt = jwtUtils.generateRefreshToken(userDetails.getEmail());

        // Extract role string without "ROLE_" prefix
        String roleStr = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse("CUSTOMER");

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshJwt)
                .email(userDetails.getEmail())
                .role(roleStr)
                .firstName(userDetails.getFirstName())
                .lastName(userDetails.getLastName())
                .userId(userDetails.getId())
                .phone(userDetails.getPhone())
                .profileImage(userDetails.getProfileImage())
                .build();

        log.info("User logged in: {}", userDetails.getEmail());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@Valid @RequestBody RefreshRequest refreshRequest) {
        String refreshToken = refreshRequest.getRefreshToken();
        if (refreshToken != null && jwtUtils.validateJwtToken(refreshToken)) {
            String email = jwtUtils.getEmailFromToken(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
            
            String newAccessToken = jwtUtils.generateAccessToken(email);
            
            AuthResponse authResponse = AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(refreshToken)
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .userId(user.getId())
                    .phone(user.getPhone())
                    .profileImage(user.getProfileImage())
                    .build();
            
            return ResponseEntity.ok(authResponse);
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or expired refresh token"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "You have been logged out successfully!"));
    }
}
