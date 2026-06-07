package com.example.application.controller;

import com.example.application.dto.TransactionDTO;
import com.example.application.model.Transaction;
import com.example.application.service.ImportService;
import com.example.application.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final ImportService importService;

    public TransactionController(TransactionService transactionService,
                                 ImportService importService) {
        this.transactionService = transactionService;
        this.importService = importService;
    }

    @GetMapping
    public List<Transaction> getAll(Principal principal) {
        return transactionService.getAll(principal.getName());
    }

    @PostMapping
    public Transaction create(@RequestBody TransactionDTO dto, Principal principal) {
        return transactionService.create(dto, principal.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public ResponseEntity<String> importCSV(@RequestParam("file") MultipartFile file,
                                            Principal principal) throws Exception {
        importService.importCSV(file, principal.getName());
        return ResponseEntity.ok("Импорт успешен");
    }
}