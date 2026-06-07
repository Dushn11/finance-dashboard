package com.example.application.service;

import com.example.application.dto.StatsDTO;
import com.example.application.model.Transaction;
import com.example.application.model.TransactionType;
import com.example.application.model.User;
import com.example.application.repository.TransactionRepository;
import com.example.application.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatsService {

    // ← поля
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    // ← конструктор
    public StatsService(TransactionRepository transactionRepository,
                        UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public StatsDTO getStats(String email) {
        // ← раньше user не был объявлен — отсюда "Cannot resolve symbol 'user'"
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        List<Transaction> all = transactionRepository.findByUserId(user.getId());

        double income = all.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double expense = all.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .mapToDouble(Transaction::getAmount)
                .sum();

        return new StatsDTO(income, expense, income - expense);
    }
}