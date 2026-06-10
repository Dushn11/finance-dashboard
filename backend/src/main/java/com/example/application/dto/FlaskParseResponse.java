package com.example.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class FlaskParseResponse {
    private String title;

    @JsonProperty("transactions")
    private List<Map<String, Object>> transactions; // Простой список транзакций

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<Map<String, Object>> getTransactions() { return transactions; }
    public void setTransactions(List<Map<String, Object>> transactions) { this.transactions = transactions; }
}