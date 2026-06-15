package com.hospital.medicine.controller;

import com.hospital.medicine.dto.request.StockExportRequest;
import com.hospital.medicine.dto.response.ApiResponse;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.dto.response.StockExportResponse;
import com.hospital.medicine.security.UserPrincipal;
import com.hospital.medicine.service.StockExportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/admin/stock-exports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class StockExportController {

    private final StockExportService stockExportService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StockExportResponse>>> getAllExports(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20, sort = "exportDate", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<StockExportResponse> response = stockExportService.getAllExports(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockExportResponse>> getExportById(@PathVariable Long id) {
        StockExportResponse response = stockExportService.getExportById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StockExportResponse>> createExport(
            @Valid @RequestBody StockExportRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StockExportResponse response = stockExportService.createExport(request, userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Stock export created successfully", response));
    }
}
