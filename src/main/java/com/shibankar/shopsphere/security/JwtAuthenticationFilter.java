package com.shibankar.shopsphere.security;

import com.shibankar.shopsphere.repository.UserRepository;
import com.shibankar.shopsphere.user.User;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        // No bearer token.
        // Continue as an unauthenticated request.
        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        String token =
                authHeader.substring(7).trim();

        if (token.isEmpty()) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        try {

            String username =
                    jwtService.extractUsername(token);

            boolean valid =
                    jwtService.isTokenValid(token);

            if (username != null &&
                    valid &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                User user =
                        userRepository
                                .findByUsername(username)
                                .orElse(null);

                if (user != null) {

                    String role =
                            user.getRole();

                    if (role == null ||
                            role.isBlank()) {

                        role = "USER";
                    }

                    role = role.trim()
                            .toUpperCase();

                    SimpleGrantedAuthority authority =
                            new SimpleGrantedAuthority(
                                    "ROLE_" + role
                            );

                    UsernamePasswordAuthenticationToken
                            authentication =
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    List.of(authority)
                            );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );
                }
            }

        } catch (Exception ignored) {

            // Invalid or expired JWT.
            // Continue the filter chain without
            // authenticating the request.
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}