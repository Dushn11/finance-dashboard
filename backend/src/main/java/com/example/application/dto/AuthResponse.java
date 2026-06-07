package com.example.application.dto;

public class AuthResponse {
    private String token;
    private UserDTO user; // Используем твой готовый UserDTO

    public AuthResponse(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }

    // ---- GETTERS ----
    public String getToken() { return token; }
    public UserDTO getUser() { return user; }

    // ---- SETTERS ----
    public void setToken(String token) { this.token = token; }
    public void setUser(UserDTO user) { this.user = user; }
}