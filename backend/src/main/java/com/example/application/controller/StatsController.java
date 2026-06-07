package com.example.application.controller;

import com.example.application.dto.StatsDTO;
import com.example.application.service.StatsService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    public StatsDTO getStats(Principal principal) {
        return statsService.getStats(principal.getName());
    }
}