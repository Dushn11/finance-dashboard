package com.example.application.controller;

import com.example.application.dto.LoginRequest;
import com.example.application.dto.RegisterRequest;
import com.example.application.dto.AuthResponse;
import com.example.application.dto.UserDTO;
import com.example.application.model.User;
import com.example.application.service.UserService;
import com.example.application.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;

    public AuthController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        System.out.println("=== REGISTER REQUEST RECEIVED ===");

        // 1. Проверка на дубликаты (чтобы база не выплёвывала 403)
        if (userRepository.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is already taken"));
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already in use"));
        }

        try {
            // 2. Регистрация через сервис
            String token = userService.register(req.getEmail(), req.getPassword(), req.getUsername());

            // 3. Достаем созданного юзера для фронта
            User savedUser = userRepository.findByEmail(req.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found after registration"));

            String role = savedUser.getRole() != null ? savedUser.getRole().toString() : "USER"; 
            UserDTO userDTO = new UserDTO(savedUser.getId(), savedUser.getEmail(), savedUser.getUsername(), role);

            return ResponseEntity.ok(new AuthResponse(token, userDTO));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            String token = userService.login(req.getEmail(), req.getPassword());

            User user = userRepository.findByEmail(req.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String role = user.getRole() != null ? user.getRole().toString() : "USER";
            UserDTO userDTO = new UserDTO(user.getId(), user.getEmail(), user.getUsername(), role);

            return ResponseEntity.ok(new AuthResponse(token, userDTO));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
    }

    // ВОТ ЭТОТ МЕТОД ОН ЗАТЁР, ВОЗВРАЩАЕМ ЕГО НА МЕСТО:
    @GetMapping("/search")
    public ResponseEntity<Map<String, Boolean>> searchAvailable(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        
        System.out.println("=== API SEARCH CHECK TRIGGERED ===");
        boolean available = true;

        if (username != null && !username.trim().isEmpty()) {
            available = !userRepository.existsByUsername(username);
        } else if (email != null && !email.trim().isEmpty()) {
            available = !userRepository.existsByEmail(email);
        }

        return ResponseEntity.ok(Map.of("available", available));
    }
}