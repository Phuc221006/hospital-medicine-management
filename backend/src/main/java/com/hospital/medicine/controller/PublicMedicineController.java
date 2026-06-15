package com.hospital.medicine.controller;

import com.hospital.medicine.dto.response.ApiResponse;
import com.hospital.medicine.dto.response.MedicineResponse;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/medicines")
@RequiredArgsConstructor
public class PublicMedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MedicineResponse>>> getMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<MedicineResponse> response = medicineService.getAllMedicines(search, categoryId, supplierId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<MedicineResponse>>> getAllForSelect() {
        List<MedicineResponse> medicines = medicineService.getAllMedicinesForSelect();
        return ResponseEntity.ok(ApiResponse.success(medicines));
    }
}
