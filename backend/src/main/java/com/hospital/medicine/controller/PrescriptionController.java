package com.hospital.medicine.controller;

import com.hospital.medicine.dto.request.PrescriptionRequest;
import com.hospital.medicine.dto.response.ApiResponse;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.dto.response.PrescriptionResponse;
import com.hospital.medicine.entity.enums.PrescriptionStatus;
import com.hospital.medicine.security.UserPrincipal;
import com.hospital.medicine.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/prescriptions")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PrescriptionResponse>>> getAllPrescriptions(
            @RequestParam(required = false) PrescriptionStatus status,
            @PageableDefault(size = 20, sort = "prescriptionDate", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<PrescriptionResponse> response = prescriptionService.getAllPrescriptions(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescriptionById(@PathVariable Long id) {
        PrescriptionResponse response = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PrescriptionResponse>> createPrescription(
            @Valid @RequestBody PrescriptionRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PrescriptionResponse response = prescriptionService.createPrescription(request, userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Prescription created successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> updatePrescriptionStatus(
            @PathVariable Long id,
            @RequestParam PrescriptionStatus status,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PrescriptionResponse response = prescriptionService.updatePrescriptionStatus(id, status, userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Prescription status updated", response));
    }
}
