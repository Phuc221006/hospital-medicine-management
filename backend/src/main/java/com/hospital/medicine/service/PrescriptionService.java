package com.hospital.medicine.service;

import com.hospital.medicine.dto.request.PrescriptionDetailRequest;
import com.hospital.medicine.dto.request.PrescriptionRequest;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.dto.response.PrescriptionResponse;
import com.hospital.medicine.entity.*;
import com.hospital.medicine.entity.enums.PrescriptionStatus;
import com.hospital.medicine.exception.ResourceNotFoundException;
import com.hospital.medicine.repository.MedicineRepository;
import com.hospital.medicine.repository.PrescriptionRepository;
import com.hospital.medicine.repository.UserRepository;
import com.hospital.medicine.dto.request.StockExportRequest;
import com.hospital.medicine.dto.request.StockExportDetailRequest;
import com.hospital.medicine.service.StockExportService;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final ActivityLogService activityLogService;
    private final StockExportService stockExportService;

    @Transactional(readOnly = true)
    public PageResponse<PrescriptionResponse> getAllPrescriptions(PrescriptionStatus status, Pageable pageable) {
        Page<Prescription> page;
        if (status != null) {
            page = prescriptionRepository.findByStatus(status, pageable);
        } else {
            page = prescriptionRepository.findAll(pageable);
        }
        return PageResponse.from(page, PrescriptionResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public PageResponse<PrescriptionResponse> getPatientPrescriptions(Long patientId, PrescriptionStatus status, Pageable pageable) {
        Page<Prescription> page;
        if (status != null) {
            page = prescriptionRepository.findByPatientIdAndStatus(patientId, status, pageable);
        } else {
            page = prescriptionRepository.findByPatientId(patientId, pageable);
        }
        return PageResponse.from(page, PrescriptionResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
        return PrescriptionResponse.fromEntity(prescription);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPatientPrescriptionHistory(Long patientId) {
        return prescriptionRepository.findByPatientIdOrderByPrescriptionDateDesc(patientId)
                .stream()
                .map(PrescriptionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionRequest request, Long userId) {
        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.getPatientId()));

        Prescription prescription = new Prescription();
        prescription.setPrescriptionCode(generatePrescriptionCode());
        prescription.setPatient(patient);
        prescription.setDoctorName(request.getDoctorName());
        prescription.setDiagnosis(request.getDiagnosis());
        prescription.setPrescriptionDate(request.getPrescriptionDate());
        prescription.setNotes(request.getNotes());
        prescription.setStatus(PrescriptionStatus.PENDING);

        for (PrescriptionDetailRequest detailRequest : request.getDetails()) {
            Medicine medicine = medicineRepository.findById(detailRequest.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", detailRequest.getMedicineId()));

            PrescriptionDetail detail = new PrescriptionDetail();
            detail.setPrescription(prescription);
            detail.setMedicine(medicine);
            detail.setQuantity(detailRequest.getQuantity());
            detail.setDosage(detailRequest.getDosage());
            detail.setFrequency(detailRequest.getFrequency());
            detail.setDuration(detailRequest.getDuration());
            detail.setInstructions(detailRequest.getInstructions());

            prescription.getDetails().add(detail);
        }

        prescription = prescriptionRepository.save(prescription);

        activityLogService.log(userId, "CREATE", "Prescription", prescription.getId(),
                "Created prescription: " + prescription.getPrescriptionCode() + " for patient: " + patient.getFullName());

        return PrescriptionResponse.fromEntity(prescription);
    }

    @Transactional
    public PrescriptionResponse updatePrescriptionStatus(Long id, PrescriptionStatus status, Long userId) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
        // If marking as DISPENSED, create a stock export (decrement batches) and link it to the prescription
        if (status == PrescriptionStatus.DISPENSED) {
            // Build export request from prescription details
            StockExportRequest exportRequest = new StockExportRequest();
            exportRequest.setPrescriptionId(prescription.getId());
            exportRequest.setPatientId(prescription.getPatient().getId());
            exportRequest.setExportDate(LocalDateTime.now());
            exportRequest.setNotes("Auto-export for prescription: " + prescription.getPrescriptionCode());

            java.util.List<StockExportDetailRequest> details = new java.util.ArrayList<>();
            for (PrescriptionDetail d : prescription.getDetails()) {
                StockExportDetailRequest det = new StockExportDetailRequest();
                det.setMedicineId(d.getMedicine().getId());
                det.setQuantity(d.getQuantity());
                details.add(det);
            }
            exportRequest.setDetails(details);

            // Create export (this will update batches). This may throw if insufficient stock.
            stockExportService.createExport(exportRequest, userId);

            // Now update prescription metadata
            prescription.setStatus(PrescriptionStatus.DISPENSED);
            User dispensedBy = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            prescription.setDispensedBy(dispensedBy);
            prescription.setDispensedAt(LocalDateTime.now());
        } else {
            prescription.setStatus(status);
        }

        prescription = prescriptionRepository.save(prescription);

        activityLogService.log(userId, "UPDATE_STATUS", "Prescription", prescription.getId(),
                "Updated prescription status to: " + status);

        return PrescriptionResponse.fromEntity(prescription);
    }

    private String generatePrescriptionCode() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "RX-" + date + "-" + uuid;
    }
}
