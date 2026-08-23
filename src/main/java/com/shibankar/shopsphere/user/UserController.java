package com.shibankar.shopsphere.user;

import com.shibankar.shopsphere.security.JwtService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(
            UserService userService,
            JwtService jwtService) {

        this.userService = userService;
        this.jwtService = jwtService;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public User registerUser(
            @Valid @RequestBody User user) {

        return userService.registerUser(user);
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public String loginUser(
            @Valid @RequestBody User user) {

        userService.loginUser(
                user.getUsername(),
                user.getPassword()
        );

        return jwtService.generateToken(
                user.getUsername()
        );
    }
}