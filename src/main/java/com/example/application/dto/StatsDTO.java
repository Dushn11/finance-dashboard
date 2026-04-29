package com.example.application.dto;

public class StatsDTO {

    private Double income;
    private Double expense;
    private Double balance;

    // ← конструктор — используется в StatsService
    public StatsDTO(Double income, Double expense, Double balance) {
        this.income = income;
        this.expense = expense;
        this.balance = balance;
    }

    // ---- GETTERS ----
    public Double getIncome() { return income; }
    public Double getExpense() { return expense; }
    public Double getBalance() { return balance; }
}