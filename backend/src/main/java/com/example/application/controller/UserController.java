package com.example.application.controller;

import com.example.application.dto.UserDTO;
import com.example.application.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserDTO getCurrentUser(Principal principal) {
        return userService.getUserByEmail(principal.getName());
    }
}
