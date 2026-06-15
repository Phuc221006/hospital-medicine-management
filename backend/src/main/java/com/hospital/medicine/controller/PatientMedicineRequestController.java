package com.hospital.medicine.controller;

import com.hospital.medicine.dto.response.ApiResponse;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.dto.response.PatientMedicineRequestResponse;
import com.hospital.medicine.entity.enums.RequestStatus;
import com.hospital.medicine.security.UserPrincipal;
import com.hospital.medicine.service.PatientMedicineRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/medicine-requests")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class PatientMedicineRequestController {

    private final PatientMedicineRequestService medicineRequestService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PatientMedicineRequestResponse>>> getAllRequests(
            @RequestParam(required = false) RequestStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<PatientMedicineRequestResponse> response = medicineRequestService.getAllRequests(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientMedicineRequestResponse>> getRequestById(@PathVariable Long id) {
        PatientMedicineRequestResponse response = medicineRequestService.getRequestById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PatientMedicineRequestResponse>> approveRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PatientMedicineRequestResponse response = medicineRequestService.approveRequest(
                id, userPrincipal.getUser().getId(), notes);
        return ResponseEntity.ok(ApiResponse.success("Medicine request approved and stock exported", response));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PatientMedicineRequestResponse>> rejectRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PatientMedicineRequestResponse response = medicineRequestService.rejectRequest(
                id, userPrincipal.getUser().getId(), notes);
        return ResponseEntity.ok(ApiResponse.success("Medicine request rejected", response));
    }
}

