package com.hospital.medicine.controller;

import com.hospital.medicine.dto.request.MedicineRequest;
import com.hospital.medicine.dto.response.ApiResponse;
import com.hospital.medicine.dto.response.MedicineResponse;
import com.hospital.medicine.dto.response.MedicineBatchResponse;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.security.UserPrincipal;
import com.hospital.medicine.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/medicines")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MedicineResponse>>> getAllMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<MedicineResponse> response =
                medicineService.getAllMedicines(search, categoryId, supplierId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<MedicineResponse>>> getAllMedicinesForSelect() {
        List<MedicineResponse> medicines = medicineService.getAllMedicinesForSelect();
        return ResponseEntity.ok(ApiResponse.success(medicines));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponse>> getMedicineById(@PathVariable Long id) {
        MedicineResponse response = medicineService.getMedicineById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/batches")
    public ResponseEntity<ApiResponse<java.util.List<MedicineBatchResponse>>> getBatches(@PathVariable Long id) {
        java.util.List<MedicineBatchResponse> batches = medicineService.getBatches(id);
        return ResponseEntity.ok(ApiResponse.success(batches));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicineResponse>> createMedicine(
            @Valid @RequestBody MedicineRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        MedicineResponse response = medicineService.createMedicine(request, userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Medicine created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponse>> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        MedicineResponse response = medicineService.updateMedicine(id, request, userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Medicine updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        medicineService.deleteMedicine(id, userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Medicine deleted successfully", null));
    }
}
