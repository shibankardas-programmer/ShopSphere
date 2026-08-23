package com.shibankar.shopsphere.user;

import com.shibankar.shopsphere.exception.BadRequestException;
import com.shibankar.shopsphere.exception.InvalidCredentialsException;
import com.shibankar.shopsphere.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    public User registerUser(User user) {

        if (user == null) {
            throw new BadRequestException(
                    "User data cannot be null."
            );
        }

        String username =
                user.getUsername() == null
                        ? ""
                        : user.getUsername().trim();

        String password =
                user.getPassword() == null
                        ? ""
                        : user.getPassword();

        if (username.isEmpty()) {
            throw new BadRequestException(
                    "Username cannot be blank."
            );
        }

        if (password.isEmpty()) {
            throw new BadRequestException(
                    "Password cannot be blank."
            );
        }

        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException(
                    "Username already exists."
            );
        }

        user.setUsername(username);

        user.setPassword(
                passwordEncoder.encode(password)
        );

        // IMPORTANT:
        // Never allow the client to choose ADMIN.
        user.setRole("USER");

        return userRepository.save(user);
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public boolean loginUser(
            String username,
            String password) {

        if (username == null ||
                username.trim().isEmpty() ||
                password == null ||
                password.isEmpty()) {

            throw new InvalidCredentialsException(
                    "Invalid username or password."
            );
        }

        User user =
                userRepository
                        .findByUsername(
                                username.trim()
                        )
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Invalid username or password."
                                )
                        );

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new InvalidCredentialsException(
                    "Invalid username or password."
            );
        }

        return true;
    }
}