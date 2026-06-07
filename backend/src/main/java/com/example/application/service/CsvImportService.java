package com.example.application.service;

import com.example.application.model.Transaction;
import com.example.application.model.TransactionType;
import com.example.application.model.User;
import com.example.application.repository.TransactionRepository;
import com.example.application.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CsvImportService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${python.service.url:http://flask:5000}")
    private String pythonServiceUrl;

    public CsvImportService(TransactionRepository transactionRepository,
                            UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> processCsvWithPython(
            MultipartFile file, 
            String tabName, 
            String tabId, 
            String columnMappingStr, 
            String separator, 
            int skipRows, 
            String userEmail) throws Exception {

        // 1. Распарсим оригинальный маппинг от Angular: {"1":"date", "11":"expense"}
        Map<String, String> angularMapping = objectMapper.readValue(
                columnMappingStr, 
                new TypeReference<Map<String, String>>() {}
        );
        
        System.out.println("=== CORRECTING MAPPING FOR PYTHON ===");
        System.out.println("Original Angular Mapping: " + angularMapping);

        // Сохраняем ключи-индексы, но переименовываем типы данных под нужды Питона
        Map<String, String> pythonMapping = new HashMap<>();
        
        for (Map.Entry<String, String> entry : angularMapping.entrySet()) {
            String columnIndexStr = entry.getKey(); // Например, "1" или "11"
            String dataType = entry.getValue();     // Например, "date" или "expense"
            
            // Если Angular прислал expense или income, объединяем в "amount" для питонячего скрипта
            if ("expense".equalsIgnoreCase(dataType) || "income".equalsIgnoreCase(dataType)) {
                pythonMapping.put(columnIndexStr, "amount");
            } else {
                pythonMapping.put(columnIndexStr, dataType.toLowerCase());
            }
        }

        // Превращаем исправленный маппинг обратно в JSON-строку
        String correctedMappingStr = objectMapper.writeValueAsString(pythonMapping);
        System.out.println("Corrected Mapping for Python: " + correctedMappingStr);

        // 2. Отправляем файл и адаптированный маппинг во Flask
        Map<String, Object> pythonResponse = sendToPythonService(file, correctedMappingStr, separator, skipRows);

        // 3. Записываем нормализованный результат в PostgreSQL
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> savedTransactions = saveTransactionsFromPythonResponse(pythonResponse, user);

        // 4. Возвращаем красивый ответ на фронтенд
        return Map.of(
                "success", true,
                "message", "CSV processed successfully",
                "tabName", tabName,
                "tabId", tabId,
                "transactionsCount", savedTransactions.size(),
                "pythonResponse", pythonResponse
        );
    }

    private Map<String, Object> sendToPythonService(
            MultipartFile file, 
            String columnMappingStr, 
            String separator, 
            int skipRows) throws Exception {
        
        String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
        StringBuilder body = new StringBuilder();

        // Поле 1: Файл csv
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"")
                .append(file.getOriginalFilename()).append("\"\r\n");
        body.append("Content-Type: text/csv\r\n\r\n");
        body.append(new String(file.getBytes(), StandardCharsets.UTF_8));
        body.append("\r\n");

        // Поле 2: columnMapping (исправленный)
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"columnMapping\"\r\n\r\n");
        body.append(columnMappingStr);
        body.append("\r\n");

        // Поле 3: separator
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"separator\"\r\n\r\n");
        body.append(separator);
        body.append("\r\n");

        // Поле 4: skipRows
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"skipRows\"\r\n\r\n");
        body.append(skipRows);
        body.append("\r\n");

        // Поле 5: tab_Id (Заглушка для Flask)
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"tab_Id\"\r\n\r\n");
        body.append("imported_tab_id");
        body.append("\r\n");

        // Поле 6: tab_Name (Заглушка для Flask)
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"tab_Name\"\r\n\r\n");
        body.append("Imported Tab");
        body.append("\r\n--").append(boundary).append("--\r\n");

        String flaskUrl = "http://flask:5000/import/csv";
        System.out.println("Sending multipart request to Flask: " + flaskUrl);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(flaskUrl))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .timeout(Duration.ofMinutes(5))
                .POST(HttpRequest.BodyPublishers.ofString(body.toString(), StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            System.out.println("!!! FLASK RETURNED ERROR STATUS !!!");
            System.out.println("Status: " + response.statusCode());
            System.out.println("Body: " + response.body());
            throw new RuntimeException("Flask error: " + response.body());
        }

        return objectMapper.readValue(response.body(), Map.class);
    }

    @SuppressWarnings("unchecked")
    private List<Transaction> saveTransactionsFromPythonResponse(Map<String, Object> pythonResponse, User user) {
        List<Transaction> savedTransactions = new ArrayList<>();
        
        // Получаем список транзакций, который нам вернул Питон
        List<Map<String, Object>> transactions = (List<Map<String, Object>>) pythonResponse.get("transactions");

        if (transactions != null) {
            for (Map<String, Object> txData : transactions) {
                try {
                    Transaction transaction = new Transaction();
                    
                    // 1. Обработка суммы (Amount)
                    if (txData.get("amount") != null) {
                        // Меняем запятую на точку, если пришел европейский формат (например, 10,89 -> 10.89)
                        String amountStr = txData.get("amount").toString().replace(",", ".");
                        transaction.setAmount(Double.parseDouble(amountStr));
                    } else {
                        transaction.setAmount(0.0);
                    }
                    
                    // 2. Обработка описания (Description)
                    if (txData.get("description") != null && !txData.get("description").toString().isBlank()) {
                        transaction.setDescription(txData.get("description").toString());
                    } else {
                        transaction.setDescription("Импортированная транзакция из CSV");
                    }
                    
                    // 3. Переводим польские типы транзакций в понятные для нашей БД (Enum)
                    if (txData.get("type") != null) {
                        String rawType = txData.get("type").toString().toUpperCase().trim();
                        
                        // "UZNANIE" — это зачисление/приход
                        if (rawType.contains("UZNANIE") || rawType.contains("INCOME")) {
                            transaction.setType(TransactionType.INCOME);
                        } 
                        // "TRANSAKCJA KARTĄ" и "OBCIĄŻENIE" — это списание/расход
                        else if (rawType.contains("TRANSAKCJA") || rawType.contains("OBCIĄŻENIE") || rawType.contains("EXPENSE")) {
                            transaction.setType(TransactionType.EXPENSE);
                        } 
                        // На всякий случай дефолтный вариант, если прилетит что-то странное
                        else {
                            transaction.setType(TransactionType.EXPENSE);
                        }
                    } else {
                        transaction.setType(TransactionType.EXPENSE);
                    }
                    
                    // Проставляем текущую дату и привязываем транзакцию к пользователю
                    transaction.setDate(LocalDateTime.now());
                    transaction.setUser(user);

                    // Сохраняем в PostgreSQL
                    Transaction saved = transactionRepository.save(transaction);
                    savedTransactions.add(saved);
                } catch (Exception e) {
                    System.out.println("Ошибка парсинга строки: " + txData + ". Текст ошибки: " + e.getMessage());
                }
            }
        }

        return savedTransactions;
    }
}