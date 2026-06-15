package com.hospital.medicine.service;

import com.hospital.medicine.dto.request.StockExportDetailRequest;
import com.hospital.medicine.dto.request.StockExportRequest;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.dto.response.StockExportResponse;
import com.hospital.medicine.entity.*;
import com.hospital.medicine.entity.enums.TransactionStatus;
import com.hospital.medicine.exception.BadRequestException;
import com.hospital.medicine.exception.ResourceNotFoundException;
import com.hospital.medicine.repository.*;
import com.hospital.medicine.entity.Prescription;
import com.hospital.medicine.entity.PrescriptionDetail;
import com.hospital.medicine.entity.enums.PrescriptionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockExportService {

    private final StockExportRepository stockExportRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineBatchRepository batchRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;
    

    @Transactional(readOnly = true)
    public PageResponse<StockExportResponse> getAllExports(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<StockExport> page;
        if (startDate != null && endDate != null) {
            page = stockExportRepository.findByDateRange(startDate, endDate, pageable);
        } else {
            page = stockExportRepository.findAll(pageable);
        }
        return PageResponse.from(page, StockExportResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public StockExportResponse getExportById(Long id) {
        StockExport stockExport = stockExportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockExport", "id", id));
        return StockExportResponse.fromEntity(stockExport);
    }

    @Transactional
    public StockExportResponse createExport(StockExportRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.getPatientId()));

        StockExport stockExport = new StockExport();
        stockExport.setExportCode(generateExportCode());
        stockExport.setExportDate(request.getExportDate());
        stockExport.setNotes(request.getNotes());
        stockExport.setExportedBy(user);
        stockExport.setPatient(patient);
        stockExport.setStatus(TransactionStatus.COMPLETED);

        if (request.getPrescriptionId() != null) {
            Prescription prescription = prescriptionRepository.findById(request.getPrescriptionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", request.getPrescriptionId()));
            stockExport.setPrescription(prescription);
        } else {
            // No prescription provided — create a prescription record from the export details
            Prescription prescription = new Prescription();
            prescription.setPrescriptionCode(generatePrescriptionCode());
            prescription.setPatient(patient);
            // Use exporter as the doctor name if available
            prescription.setDoctorName(user.getFullName() != null ? user.getFullName() : user.getEmail());
            prescription.setDiagnosis(null);
            prescription.setPrescriptionDate(request.getExportDate() != null ? request.getExportDate() : LocalDateTime.now());
            prescription.setStatus(PrescriptionStatus.DISPENSED);
            prescription.setNotes("Auto-generated from stock export: " + stockExport.getExportCode());

            for (StockExportDetailRequest detailRequest : request.getDetails()) {
                Medicine medicine = medicineRepository.findById(detailRequest.getMedicineId())
                        .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", detailRequest.getMedicineId()));

                PrescriptionDetail pd = new PrescriptionDetail();
                pd.setPrescription(prescription);
                pd.setMedicine(medicine);
                pd.setQuantity(detailRequest.getQuantity());
                pd.setDosage("");
                pd.setFrequency("");
                pd.setDuration(null);
                pd.setInstructions("Generated from export");

                prescription.getDetails().add(pd);
            }

            prescription = prescriptionRepository.save(prescription);
            stockExport.setPrescription(prescription);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (StockExportDetailRequest detailRequest : request.getDetails()) {
            Medicine medicine = medicineRepository.findById(detailRequest.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", detailRequest.getMedicineId()));

            // Get available batches (FIFO - First Expiry First Out)
            List<MedicineBatch> availableBatches = batchRepository.findAvailableBatches(
                    medicine.getId(), LocalDate.now());

            int remainingQuantity = detailRequest.getQuantity();

            for (MedicineBatch batch : availableBatches) {
                if (remainingQuantity <= 0) break;

                int quantityFromBatch = Math.min(remainingQuantity, batch.getRemainingQuantity());

                // Create export detail
                StockExportDetail detail = new StockExportDetail();
                detail.setStockExport(stockExport);
                detail.setMedicine(medicine);
                detail.setBatch(batch);
                detail.setQuantity(quantityFromBatch);
                detail.setUnitPrice(medicine.getPrice());
                detail.setTotalPrice(medicine.getPrice().multiply(BigDecimal.valueOf(quantityFromBatch)));

                stockExport.getDetails().add(detail);
                totalAmount = totalAmount.add(detail.getTotalPrice());

                // Update batch remaining quantity
                batch.setRemainingQuantity(batch.getRemainingQuantity() - quantityFromBatch);
                batchRepository.save(batch);

                remainingQuantity -= quantityFromBatch;
            }

//            if (remainingQuantity > 0) {
//                throw new BadRequestException("Insufficient stock for medicine: " + medicine.getName());
//            }
        }

        stockExport.setTotalAmount(totalAmount);
        stockExport = stockExportRepository.save(stockExport);

        activityLogService.log(userId, "EXPORT", "StockExport", stockExport.getId(),
                "Created stock export: " + stockExport.getExportCode() + " for patient: " + patient.getFullName());

        return StockExportResponse.fromEntity(stockExport);
    }

    private String generateExportCode() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "EXP-" + date + "-" + uuid;
    }

    private String generatePrescriptionCode() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "RX-" + date + "-" + uuid;
    }
}
