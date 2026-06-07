package com.example.application.service;

import com.example.application.dto.TransactionDTO;
import com.example.application.model.Transaction;
import com.example.application.model.User;
import com.example.application.repository.TransactionRepository;
import com.example.application.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TransactionService {

    // ← поля — без них все "Cannot resolve symbol"
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    // ← конструктор
    public TransactionService(TransactionRepository transactionRepository,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public Transaction create(TransactionDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Transaction t = new Transaction();
        t.setAmount(dto.getAmount());
        t.setDescription(dto.getDescription());
        t.setType(dto.getType());
        t.setDate(LocalDateTime.now());
        t.setUser(user);

        return transactionRepository.save(t);
    }

    public List<Transaction> getAll(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        return transactionRepository.findByUserId(user.getId());
    }

    public void delete(Long id) {
        transactionRepository.deleteById(id);
    }
}