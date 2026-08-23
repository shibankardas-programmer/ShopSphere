package com.shibankar.shopsphere.config;

import com.shibankar.shopsphere.repository.UserRepository;
import com.shibankar.shopsphere.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@EnableMethodSecurity
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserRepository userRepository;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            UserRepository userRepository) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;

        this.userRepository =
                userRepository;
    }

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // USER DETAILS SERVICE
    // =========================================================

    @Bean
    public UserDetailsService userDetailsService() {

        return username ->
                userRepository
                        .findByUsername(username)
                        .map(user ->
                                org.springframework.security
                                        .core.userdetails.User
                                        .withUsername(
                                                user.getUsername()
                                        )
                                        .password(
                                                user.getPassword()
                                        )
                                        .roles(
                                                user.getRole() == null ||
                                                user.getRole().isBlank()
                                                        ? "USER"
                                                        : user.getRole()
                                        )
                                        .build()
                        )
                        .orElseThrow(
                                () ->
                                        new UsernameNotFoundException(
                                                "User not found: "
                                                        + username
                                        )
                        );
    }

    // =========================================================
    // AUTHENTICATION PROVIDER
    // =========================================================

    @Bean
    public DaoAuthenticationProvider
    authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                        userDetailsService()
                );

        provider.setPasswordEncoder(
                passwordEncoder()
        );

        return provider;
    }

    // =========================================================
    // AUTHENTICATION MANAGER
    // =========================================================

    @Bean
    public AuthenticationManager
    authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration
                .getAuthenticationManager();
    }

    // =========================================================
    // CORS
    // =========================================================

    @Bean
    public CorsConfigurationSource
    corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                Arrays.asList(
                        "http://localhost:5173"
                )
        );

        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                Arrays.asList("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http

                // CORS
                .cors(cors -> {})

                // JWT APIs do not use CSRF cookies.
                .csrf(csrf -> csrf.disable())

                // Authorization
                .authorizeHttpRequests(auth -> auth

                        // -----------------------------------------
                        // CORS PREFLIGHT
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // -----------------------------------------
                        // PUBLIC USER ENDPOINTS
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/login"
                        ).permitAll()

                        // -----------------------------------------
                        // SWAGGER
                        // -----------------------------------------

                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // -----------------------------------------
                        // PUBLIC PRODUCT READ
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/products",
                                "/api/products/**"
                        ).permitAll()

                        // -----------------------------------------
                        // CART
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/cart",
                                "/api/cart/**"
                        ).authenticated()

                        // -----------------------------------------
                        // ADMIN ENDPOINTS
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        // -----------------------------------------
                        // ADMIN PRODUCT CREATE
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/products/**"
                        ).hasRole("ADMIN")

                        // -----------------------------------------
                        // ADMIN PRODUCT UPDATE
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/products/**"
                        ).hasRole("ADMIN")

                        // -----------------------------------------
                        // ADMIN PRODUCT DELETE
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/products/**"
                        ).hasRole("ADMIN")

                        // -----------------------------------------
                        // EVERYTHING ELSE
                        // -----------------------------------------

                        .anyRequest().authenticated()
                )

                // JWT FILTER
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}