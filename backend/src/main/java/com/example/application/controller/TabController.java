package com.example.application.controller;

import com.example.application.dto.SaveTabRequest;
import com.example.application.dto.TabResponse;
import com.example.application.service.TabService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tabs")
public class TabController {

    private final TabService tabService;

    public TabController(TabService tabService) {
        this.tabService = tabService;
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

    @PostMapping("/import")
    public ResponseEntity<TabResponse> importFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            TabResponse response = tabService.importFile(file, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
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
}
