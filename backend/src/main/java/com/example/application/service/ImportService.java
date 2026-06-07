package com.example.application.service;

import com.example.application.model.Transaction;
import com.example.application.model.TransactionType;
import com.example.application.model.User;
import com.example.application.repository.TransactionRepository;
import com.example.application.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;

@Service
public class ImportService {

    // ← без этих полей Java ищет статический метод save() — отсюда ошибка
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    // ← конструктор
    public ImportService(TransactionRepository transactionRepository,
                         UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public void importCSV(MultipartFile file, String email) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()));

        String line;
        reader.readLine(); // пропускаем заголовок

        while ((line = reader.readLine()) != null) {
            String[] parts = line.split(",");

            Transaction t = new Transaction();
            t.setAmount(Double.parseDouble(parts[0].trim()));
            t.setDescription(parts[1].trim());
            t.setType(TransactionType.valueOf(parts[2].trim()));
            t.setDate(LocalDateTime.now());
            t.setUser(user);

            transactionRepository.save(t); // ← теперь вызывается на объекте, не статически
        }
    }
}