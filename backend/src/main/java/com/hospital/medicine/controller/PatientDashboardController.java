package com.hospital.medicine.controller;

import com.hospital.medicine.dto.request.PatientMedicineRequestRequest;
import com.hospital.medicine.dto.request.UpdateProfileRequest;
import com.hospital.medicine.dto.response.ApiResponse;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.dto.response.PatientMedicineRequestResponse;
import com.hospital.medicine.dto.response.PrescriptionResponse;
import com.hospital.medicine.dto.response.UserResponse;
import com.hospital.medicine.entity.Appointment;
import com.hospital.medicine.entity.Notification;
import com.hospital.medicine.entity.enums.PrescriptionStatus;
import com.hospital.medicine.security.UserPrincipal;
import com.hospital.medicine.service.AppointmentService;
import com.hospital.medicine.service.NotificationService;
import com.hospital.medicine.service.PatientMedicineRequestService;
import com.hospital.medicine.service.PatientService;
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

import java.util.List;

@RestController
@RequestMapping("/patient")
@RequiredArgsConstructor
public class PatientDashboardController {

    private final PatientService patientService;
    private final PrescriptionService prescriptionService;
    private final AppointmentService appointmentService;
    private final NotificationService notificationService;
    private final PatientMedicineRequestService medicineRequestService;

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserResponse response = patientService.getPatientById(userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/prescriptions")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PageResponse<PrescriptionResponse>>> getMyPrescriptions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) PrescriptionStatus status,
            @PageableDefault(size = 20, sort = "prescriptionDate", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<PrescriptionResponse> response = prescriptionService.getPatientPrescriptions(
                userPrincipal.getUser().getId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/prescriptions/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescriptionById(
            @PathVariable Long id) {
        PrescriptionResponse response = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<Appointment>>> getUpcomingAppointments(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Appointment> appointments = appointmentService.getUpcomingAppointments(
                userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/notifications")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PageResponse<Notification>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<Notification> response = notificationService.getUserNotifications(
                userPrincipal.getUser().getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/notifications/unread-count")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Long>> getUnreadNotificationCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        long count = notificationService.getUnreadCount(userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PostMapping("/notifications/{id}/read")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PostMapping("/notifications/read-all")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> markAllNotificationsAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.markAllAsRead(userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateProfileRequest request) {
        UserResponse updated = patientService.updateProfile(userPrincipal.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/profile")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        patientService.deletePatient(userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Account deleted", null));
    }

    @PostMapping("/appointments")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Appointment>> bookAppointment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody com.hospital.medicine.dto.request.BookAppointmentRequest request) {
        Appointment appointment = appointmentService.createAppointment(userPrincipal.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Appointment booked", appointment));
    }

    @PostMapping("/medicine-requests")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientMedicineRequestResponse>> createMedicineRequest(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PatientMedicineRequestRequest request) {
        PatientMedicineRequestResponse response = medicineRequestService.createRequest(
                userPrincipal.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Medicine request created", response));
    }

    @GetMapping("/medicine-requests")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<PatientMedicineRequestResponse>>> getMyMedicineRequests(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<PatientMedicineRequestResponse> response = medicineRequestService.getPatientRequests(
                userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
