package com.example.application.controller;

import com.example.application.dto.LoginRequest;
import com.example.application.dto.RegisterRequest;
import com.example.application.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest req) {
        System.out.println("=== REGISTER REQUEST RECEIVED ===");
        System.out.println("Email: " + req.getEmail());
        System.out.println("Username: " + req.getUsername());
        System.out.println("Password: " + (req.getPassword() != null ? "***" : "null"));
        String token = userService.register(req.getEmail(), req.getPassword(), req.getUsername());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest req) {
        String token = userService.login(req.getEmail(), req.getPassword());
        return ResponseEntity.ok(Map.of("token", token));
    }
}