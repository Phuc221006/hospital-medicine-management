package com.hospital.medicine.controller;

import com.hospital.medicine.dto.request.StockImportRequest;
import com.hospital.medicine.dto.response.ApiResponse;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.dto.response.StockImportResponse;
import com.hospital.medicine.security.UserPrincipal;
import com.hospital.medicine.service.StockImportService;
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
@RequestMapping("/admin/stock-imports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class StockImportController {

    private final StockImportService stockImportService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StockImportResponse>>> getAllImports(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20, sort = "importDate", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<StockImportResponse> response = stockImportService.getAllImports(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Alias endpoint used by frontend: /admin/stock-imports/all
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<PageResponse<StockImportResponse>>> getAllImportsForAll(
            @PageableDefault(size = 20, sort = "importDate", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<StockImportResponse> response = stockImportService.getAllImports(null, null, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockImportResponse>> getImportById(@PathVariable Long id) {
        StockImportResponse response = stockImportService.getImportById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StockImportResponse>> createImport(
            @Valid @RequestBody StockImportRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StockImportResponse response = stockImportService.createImport(request, userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Stock import created successfully", response));
    }
}
