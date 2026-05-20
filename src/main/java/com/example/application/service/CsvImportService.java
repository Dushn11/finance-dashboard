package com.example.application.service;

import com.example.application.model.Transaction;
import com.example.application.model.TransactionType;
import com.example.application.model.User;
import com.example.application.repository.TransactionRepository;
import com.example.application.repository.UserRepository;
import com.example.application.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
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

    private final JwtUtil jwtUtil;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${python.service.url:http://100.92.130.10}")
    private String pythonServiceUrl;

    public CsvImportService(JwtUtil jwtUtil,
                            TransactionRepository transactionRepository,
                            UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> processCsvWithPython(MultipartFile file, String userEmail) throws Exception {
        // 1. Читаем CSV и проверяем JWT токен
        String jwtToken = extractAndValidateJwtFromCsv(file);

        if (!jwtUtil.isValid(jwtToken)) {
            throw new RuntimeException("Invalid JWT token in CSV file");
        }

        // 2. Отправляем файл на Python сервис
        Map<String, Object> pythonResponse = sendToPythonService(file, jwtToken);

        // 3. Записываем результат в базу данных
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> savedTransactions = saveTransactionsFromPythonResponse(pythonResponse, user);

        // 4. Возвращаем результат на фронт
        return Map.of(
                "success", true,
                "message", "CSV processed successfully",
                "transactionsCount", savedTransactions.size(),
                "pythonResponse", pythonResponse
        );
    }

    private String extractAndValidateJwtFromCsv(MultipartFile file) throws Exception {
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));

        String firstLine = reader.readLine();
        if (firstLine == null) {
            throw new RuntimeException("CSV file is empty");
        }

        // Предполагаем, что JWT токен находится в первой строке или в заголовке
        // Формат: "jwt_token,amount,description,type" или просто токен в первой строке
        String[] parts = firstLine.split(",");
        String jwtToken = parts[0].trim();

        // Проверяем, что это похоже на JWT (формат: xxx.yyy.zzz)
        if (!jwtToken.matches("^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+$")) {
            throw new RuntimeException("Invalid JWT token format in CSV");
        }

        reader.close();
        return jwtToken;
    }

    private Map<String, Object> sendToPythonService(MultipartFile file, String jwtToken) throws Exception {
        // Создаем multipart request для отправки файла на Python
        String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();

        StringBuilder body = new StringBuilder();
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"")
                .append(file.getOriginalFilename()).append("\"\r\n");
        body.append("Content-Type: text/csv\r\n\r\n");
        body.append(new String(file.getBytes(), StandardCharsets.UTF_8));
        body.append("\r\n--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"jwt_token\"\r\n\r\n");
        body.append(jwtToken);
        body.append("\r\n--").append(boundary).append("--\r\n");

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(pythonServiceUrl + "/process-csv"))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .timeout(Duration.ofMinutes(5))
                .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Python service returned error: " + response.body());
        }

        return objectMapper.readValue(response.body(), Map.class);
    }

    private List<Transaction> saveTransactionsFromPythonResponse(Map<String, Object> pythonResponse, User user) {
        List<Transaction> savedTransactions = new ArrayList<>();

        // Предполагаем, что Python возвращает список транзакций в поле "transactions"
        List<Map<String, Object>> transactions = (List<Map<String, Object>>) pythonResponse.get("transactions");

        if (transactions != null) {
            for (Map<String, Object> txData : transactions) {
                Transaction transaction = new Transaction();
                transaction.setAmount(Double.parseDouble(txData.get("amount").toString()));
                transaction.setDescription(txData.get("description").toString());
                transaction.setType(TransactionType.valueOf(txData.get("type").toString()));
                transaction.setDate(LocalDateTime.now());
                transaction.setUser(user);

                Transaction saved = transactionRepository.save(transaction);
                savedTransactions.add(saved);
            }
        }

        return savedTransactions;
    }
}
