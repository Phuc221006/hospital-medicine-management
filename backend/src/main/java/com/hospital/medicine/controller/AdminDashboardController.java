package com.hospital.medicine.controller;

import com.hospital.medicine.dto.response.AlertResponse;
import com.hospital.medicine.dto.response.ApiResponse;
import com.hospital.medicine.dto.response.DashboardStatsResponse;
import com.hospital.medicine.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // Alias for frontend: /admin/dashboard/kpis
    @GetMapping("/kpis")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardKPIs() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getAlerts() {
        List<AlertResponse> alerts = dashboardService.getAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }
}
