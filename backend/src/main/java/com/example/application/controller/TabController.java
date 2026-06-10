package com.example.application.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.application.dto.SaveTabRequest;
import com.example.application.dto.TabResponse;
import com.example.application.model.User;
import com.example.application.repository.UserRepository;
import com.example.application.service.TabService;
import com.example.application.util.JwtUtil;

@RestController
@RequestMapping("/api/tabs")
public class TabController {

    private final TabService tabService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public TabController(TabService tabService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.tabService = tabService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/save")
    public ResponseEntity<TabResponse> saveTab(@RequestBody SaveTabRequest request) {
        try {
            TabResponse response = tabService.saveTab(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<TabResponse> importFile(
        @RequestPart("file") MultipartFile file,
        @RequestParam("userId") String userId,       // Принимаем как String!
        @RequestParam("title") String title,         // Принимаем как String!
        @RequestParam("separator") String separator, // Принимаем как String!
        @RequestParam("skipRows") String skipRows,   // Принимаем как String!
        @RequestParam("mapping") String mappingJson  // Принимаем как String!
) {
    // ЭТИ ЛОГИ ДОЛЖНЫ ПОЯВИТЬСЯ В КОНСОЛИ ГАРАНТИРОВАННО!
    System.out.println("================================");
    System.out.println(">>> СВЯЗЬ ЕСТЬ! Запрос вошел в контроллер! <<<");
    System.out.println("userId: " + userId);
    System.out.println("title: " + title);
    System.out.println("skipRows: " + skipRows);
    System.out.println("mapping: " + mappingJson);
    System.out.println("================================");

    try {
        // Вручную парсим типы, здесь мы сразу увидим, если что-то упадет
        Long parsedUserId = Long.parseLong(userId);
        Integer parsedSkipRows = Integer.parseInt(skipRows);

        // Передаем в сервис уже правильные типы
        TabResponse response = tabService.importFile(file, parsedUserId, title, separator, parsedSkipRows, mappingJson);
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        System.err.println("!!! ОШИБКА ВНУТРИ МЕТОДА ИМПОРТА !!!");
        e.printStackTrace(); // Нам нужен этот стек ошибок в докере!
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
    @GetMapping("/{id}")
    public ResponseEntity<TabResponse> getTab(@PathVariable Long id) {
        try {
            TabResponse response = tabService.getTabById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<Map<String, Object>>> getTabTransactions(@PathVariable Long id) {
        try {
            List<Map<String, Object>> transactions = tabService.getTabTransactions(id);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
  public ResponseEntity<List<TabResponse>> getUserTabs(@RequestHeader("Authorization") String token) {
      try {
          System.out.println("=== GET TABS REQUEST ===");
          String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
          System.out.println("Email: " + email);

          User user = userRepository.findByEmail(email)
              .orElseThrow(() -> new RuntimeException("User not found"));

          System.out.println("User ID: " + user.getId());

          List<TabResponse> tabs = tabService.getTabsByUserId(user.getId());

          System.out.println("Tabs count: " + tabs.size());

          return ResponseEntity.ok(tabs);
      } catch (Exception e) {
          e.printStackTrace();
          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
  }
}
