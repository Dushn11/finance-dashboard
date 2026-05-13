package com.example.application.dto;

import com.example.application.model.TransactionType;

public class TransactionDTO {

    private Double amount;
    private String description;
    private TransactionType type;

    // ---- GETTERS ----
    public Double getAmount() { return amount; }
    public String getDescription() { return description; }
    public TransactionType getType() { return type; }

    // ---- SETTERS ----
    public void setAmount(Double amount) { this.amount = amount; }
    public void setDescription(String description) { this.description = description; }
    public void setType(TransactionType type) { this.type = type; }
}