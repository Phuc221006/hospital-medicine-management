package com.hospital.medicine.service;

import com.hospital.medicine.dto.request.PatientMedicineRequestRequest;
import com.hospital.medicine.dto.request.StockExportDetailRequest;
import com.hospital.medicine.dto.request.StockExportRequest;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.dto.response.PatientMedicineRequestResponse;
import com.hospital.medicine.entity.Medicine;
import com.hospital.medicine.entity.PatientMedicineRequest;
import com.hospital.medicine.entity.User;
import com.hospital.medicine.entity.enums.NotificationType;
import com.hospital.medicine.entity.enums.RequestStatus;
import com.hospital.medicine.exception.BadRequestException;
import com.hospital.medicine.exception.ResourceNotFoundException;
import com.hospital.medicine.repository.MedicineRepository;
import com.hospital.medicine.repository.PatientMedicineRequestRepository;
import com.hospital.medicine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientMedicineRequestService {

    private final PatientMedicineRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final StockExportService stockExportService;
    private final NotificationService notificationService;

    @Transactional
    public PatientMedicineRequestResponse createRequest(Long patientId, PatientMedicineRequestRequest request) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", patientId));

        PatientMedicineRequest.PatientMedicineRequestBuilder builder = PatientMedicineRequest.builder()
                .patient(patient)
                .medicineName(request.getMedicineName())
                .quantity(request.getQuantity())
                .reason(request.getReason())
                .status(com.hospital.medicine.entity.enums.RequestStatus.PENDING);

        // If medicineId is provided, try to link it
        if (request.getMedicineId() != null) {
            Medicine medicine = medicineRepository.findById(request.getMedicineId())
                    .orElse(null); // Don't throw error if medicine not found, just use name
            if (medicine != null) {
                builder.medicine(medicine);
            }
        }

        PatientMedicineRequest savedRequest = requestRepository.save(builder.build());
        return toResponse(savedRequest);
    }

    @Transactional(readOnly = true)
    public PageResponse<PatientMedicineRequestResponse> getPatientRequests(Long patientId, Pageable pageable) {
        Page<PatientMedicineRequest> page = requestRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable);
        return PageResponse.from(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<PatientMedicineRequestResponse> getPatientRequests(Long patientId) {
        List<PatientMedicineRequest> requests = requestRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        return requests.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PatientMedicineRequestResponse getRequestById(Long id) {
        PatientMedicineRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine request", "id", id));
        return toResponse(request);
    }

    @Transactional(readOnly = true)
    public PageResponse<PatientMedicineRequestResponse> getAllRequests(RequestStatus status, Pageable pageable) {
        Page<PatientMedicineRequest> page;
        if (status != null) {
            page = requestRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        } else {
            page = requestRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return PageResponse.from(page, this::toResponse);
    }

    @Transactional
    public PatientMedicineRequestResponse approveRequest(Long requestId, Long adminId, String notes) {
        PatientMedicineRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine request", "id", requestId));

        if (RequestStatus.PENDING != request.getStatus()) {
            throw new BadRequestException("Request is not pending");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        // Find medicine by ID or name
        Medicine medicine = null;
        if (request.getMedicine() != null) {
            medicine = request.getMedicine();
        } else if (request.getMedicineName() != null) {
            // Try to find by name
            medicine = medicineRepository.findByName(request.getMedicineName())
                    .stream()
                    .findFirst()
                    .orElse(null);
        }

        if (medicine == null) {
            throw new BadRequestException("Medicine not found: " + request.getMedicineName());
        }

        // Check stock availability
        int availableStock = medicine.getTotalStock();
        if (availableStock < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock. Available: " + availableStock + ", Requested: " + request.getQuantity());
        }

        // Create stock export
        StockExportRequest exportRequest = new StockExportRequest();
        exportRequest.setPatientId(request.getPatient().getId());
        exportRequest.setExportDate(LocalDateTime.now());
        exportRequest.setNotes("Approved medicine request #" + requestId + (notes != null ? ". " + notes : ""));
        
        StockExportDetailRequest detailRequest = new StockExportDetailRequest();
        detailRequest.setMedicineId(medicine.getId());
        detailRequest.setQuantity(request.getQuantity());
        exportRequest.setDetails(List.of(detailRequest));

        try {
            stockExportService.createExport(exportRequest, adminId);
        } catch (Exception e) {
            throw new BadRequestException("Failed to export stock: " + e.getMessage());
        }

        // Update request status
        request.setStatus(RequestStatus.APPROVED);
        request.setProcessedBy(admin);
        request.setProcessedAt(LocalDateTime.now());
        request.setNotes(notes);
        request = requestRepository.save(request);

        // Send notifications
        notificationService.createNotification(
                request.getPatient().getId(),
                "Yêu cầu thuốc đã được duyệt",
                "Yêu cầu thuốc " + request.getMedicineName() + " (số lượng: " + request.getQuantity() + ") đã được duyệt và xuất kho.",
                NotificationType.SUCCESS,
                "/patient/medicine-requests"
        );

        return toResponse(request);
    }

    @Transactional
    public PatientMedicineRequestResponse rejectRequest(Long requestId, Long adminId, String notes) {
        PatientMedicineRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine request", "id", requestId));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Request is not pending");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        // Update request status
        request.setStatus(RequestStatus.REJECTED);
        request.setProcessedBy(admin);
        request.setProcessedAt(LocalDateTime.now());
        request.setNotes(notes);
        request = requestRepository.save(request);

        // Send notification
        notificationService.createNotification(
                request.getPatient().getId(),
                "Yêu cầu thuốc đã bị từ chối",
                "Yêu cầu thuốc " + request.getMedicineName() + " (số lượng: " + request.getQuantity() + ") đã bị từ chối." + (notes != null ? " Lý do: " + notes : ""),
                NotificationType.WARNING,
                "/patient/medicine-requests"
        );

        return toResponse(request);
    }

    private PatientMedicineRequestResponse toResponse(PatientMedicineRequest request) {
        PatientMedicineRequestResponse.PatientMedicineRequestResponseBuilder builder = PatientMedicineRequestResponse.builder()
                .id(request.getId())
                .patientId(request.getPatient().getId())
                .patientName(request.getPatient().getFullName())
                .medicineName(request.getMedicineName())
                .quantity(request.getQuantity())
                .reason(request.getReason())
                .status(request.getStatus())
                .processedAt(request.getProcessedAt())
                .notes(request.getNotes())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt());

        if (request.getMedicine() != null) {
            builder.medicineId(request.getMedicine().getId());
        }

        if (request.getProcessedBy() != null) {
            builder.processedById(request.getProcessedBy().getId())
                    .processedByName(request.getProcessedBy().getFullName());
        }

        return builder.build();
    }
}

