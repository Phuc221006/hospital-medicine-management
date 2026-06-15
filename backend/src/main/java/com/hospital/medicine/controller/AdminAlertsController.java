package com.hospital.medicine.controller;

import com.hospital.medicine.dto.response.AlertResponse;
import com.hospital.medicine.dto.response.ApiResponse;
import com.hospital.medicine.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/alerts")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAlertsController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getAlerts() {
        List<AlertResponse> alerts = dashboardService.getAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }
}
