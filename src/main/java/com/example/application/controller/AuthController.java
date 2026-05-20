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
    public ResponseEntity<Map<String, String>> register(@RequestBody String rawJson) {
        System.out.println("=== REGISTER REQUEST RECEIVED ===");
        System.out.println("Raw JSON: " + rawJson);

        // Parse manually to see what's coming
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        RegisterRequest req;
        try {
            req = mapper.readValue(rawJson, RegisterRequest.class);
            System.out.println("Parsed - Email: " + req.getEmail());
            System.out.println("Parsed - Username: " + req.getUsername());
            System.out.println("Parsed - Password: " + (req.getPassword() != null ? "***" : "null"));
        } catch (Exception e) {
            System.out.println("Parse error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid JSON"));
        }

        String token = userService.register(req.getEmail(), req.getPassword(), req.getUsername());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest req) {
        String token = userService.login(req.getEmail(), req.getPassword());
        return ResponseEntity.ok(Map.of("token", token));
    }
}