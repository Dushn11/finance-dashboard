package com.example.application.service;

import com.example.application.dto.FlaskParseResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FlaskIntegrationService {

    @Value("${python.service.url}")
    private String flaskServiceUrl;

    private final RestTemplate restTemplate;

    public FlaskIntegrationService() {
        this.restTemplate = new RestTemplate();
    }

    // Изменили сигнатуру: теперь метод принимает ВСЕ параметры для парсинга
    public FlaskParseResponse parseFile(MultipartFile file, String separator, Integer skipRows, String mappingJson) {
        try {
            // ВАЖНО: Убедись, что эндпоинт во Flask совпадает (/api/parse или /api/parse-csv)
            String url = flaskServiceUrl + "/import/csv"; 

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // 1. Добавляем сам файл
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            // 2. ДОБАВЛЯЕМ ОСТАЛЬНЫЕ ПАРАМЕТРЫ, чтобы Flask их прочитал!
            body.add("separator", separator);
            body.add("skipRows", skipRows.toString());
            body.add("columnMapping", mappingJson);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<FlaskParseResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    FlaskParseResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }

            throw new RuntimeException("Flask service returned non-OK status: " + response.getStatusCode());

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse file via Flask service: " + e.getMessage(), e);
        }
    }
}