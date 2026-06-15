package com.hospital.medicine.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.hospital.medicine.dto.request.GoogleLoginRequest;
import com.hospital.medicine.dto.request.LoginRequest;
import com.hospital.medicine.dto.request.RefreshTokenRequest;
import com.hospital.medicine.dto.request.RegisterRequest;
import com.hospital.medicine.dto.response.AuthResponse;
import com.hospital.medicine.dto.response.UserResponse;
import com.hospital.medicine.entity.RefreshToken;
import com.hospital.medicine.entity.User;
import com.hospital.medicine.entity.enums.AuthProvider;
import com.hospital.medicine.entity.enums.Role;
import com.hospital.medicine.exception.BadRequestException;
import com.hospital.medicine.exception.UnauthorizedException;
import com.hospital.medicine.repository.RefreshTokenRepository;
import com.hospital.medicine.repository.UserRepository;
import com.hospital.medicine.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Value("${google.client-id}")
    private String googleClientId;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new UnauthorizedException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String googleId = payload.getSubject();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createGoogleUser(email, googleId, name, pictureUrl));

            // Update Google info if user exists
            if (user.getProvider() == AuthProvider.GOOGLE) {
                user.setProviderId(googleId);
                user.setAvatarUrl(pictureUrl);
                userRepository.save(user);
            }

            return generateAuthResponse(user);

        } catch (Exception e) {
            log.error("Google login error", e);
            throw new UnauthorizedException("Google authentication failed: " + e.getMessage());
        }
    }

    private User createGoogleUser(String email, String googleId, String name, String pictureUrl) {
        User user = User.builder()
                .email(email)
                .fullName(name)
                .avatarUrl(pictureUrl)
                .provider(AuthProvider.GOOGLE)
                .providerId(googleId)
                .role(Role.PATIENT)
                .enabled(true)
                .build();
        return userRepository.save(user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .provider(AuthProvider.LOCAL)
                .role(Role.ADMIN)
                .enabled(true)
                .build();

        userRepository.save(user);
        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token has expired");
        }

        User user = refreshToken.getUser();
        refreshTokenRepository.delete(refreshToken);

        return generateAuthResponse(user);
    }

    @Transactional
    public void logout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        refreshTokenRepository.deleteByUser(user);
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = tokenProvider.generateAccessToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        // Save refresh token
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusSeconds(tokenProvider.getRefreshTokenExpiration() / 1000))
                .build();
        refreshTokenRepository.save(token);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpiration() / 1000)
                .user(UserResponse.fromEntity(user))
                .build();
    }
}
