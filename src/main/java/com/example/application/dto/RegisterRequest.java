package com.example.application.dto;

public class RegisterRequest {

    private String email;
    private String password;
    private String username;

    // ---- GETTERS ----
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getUsername() { return username; }

    // ---- SETTERS ----
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setUsername(String username) { this.username = username; }
}