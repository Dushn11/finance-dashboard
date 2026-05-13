package com.example.application.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private String description;
    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // ---- GETTERS ----
    public Long getId() { return id; }
    public Double getAmount() { return amount; }
    public String getDescription() { return description; }
    public LocalDateTime getDate() { return date; }
    public TransactionType getType() { return type; }
    public User getUser() { return user; }

    // ---- SETTERS ----
    public void setId(Long id) { this.id = id; }
    public void setAmount(Double amount) { this.amount = amount; }
    public void setDescription(String description) { this.description = description; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public void setType(TransactionType type) { this.type = type; }
    public void setUser(User user) { this.user = user; }
}