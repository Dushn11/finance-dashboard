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

    public FlaskParseResponse parseFile(MultipartFile file) {
        try {
            String url = flaskServiceUrl + "/api/parse";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

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
