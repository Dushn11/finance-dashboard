package com.example.application.controller;

import com.example.application.service.CsvImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    private final CsvImportService csvImportService;

    public ImportController(CsvImportService csvImportService) {
        this.csvImportService = csvImportService;
    }

    @PostMapping("/csv")
    public ResponseEntity<?> importCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("tabName") String tabName,
            @RequestParam("tabId") String tabId,
            @RequestParam("columnMapping") String columnMappingStr, // Принимаем JSON-строку от Angular
            @RequestParam("separator") String separator,
            @RequestParam("skipRows") int skipRows,
            Principal principal) {
        try {
            // Передаем все параметры формы в сервис
            Map<String, Object> result = csvImportService.processCsvWithPython(
                    file, tabName, tabId, columnMappingStr, separator, skipRows, principal.getName()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace(); // Чтобы видеть полную ошибку в логах докера
            String message = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", message));
        }
    }
}