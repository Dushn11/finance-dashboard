package com.example.application.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private String description;
    private LocalDateTime date;

    @ManyToOne
    @Enumerated(EnumType.STRING)
    private TransactionType type;
}