package com.hospital.medicine.controller;

import com.hospital.medicine.dto.request.RegisterRequest;
import com.hospital.medicine.dto.request.UpdateProfileRequest;
import com.hospital.medicine.dto.response.ApiResponse;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.dto.response.PrescriptionResponse;
import com.hospital.medicine.dto.response.UserResponse;
import com.hospital.medicine.service.PatientService;
import com.hospital.medicine.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/patients")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class PatientManagementController {

    private final PatientService patientService;
    private final PrescriptionService prescriptionService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllPatients(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "fullName", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<UserResponse> response = patientService.getAllPatients(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createPatient(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = patientService.createPatient(request);
        return ResponseEntity.ok(ApiResponse.success("Patient created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getPatientById(@PathVariable Long id) {
        UserResponse response = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/prescriptions")
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> getPatientPrescriptionHistory(@PathVariable Long id) {
        List<PrescriptionResponse> response = prescriptionService.getPatientPrescriptionHistory(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse response = patientService.updateProfile(id, request);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully", null));
    }
}
