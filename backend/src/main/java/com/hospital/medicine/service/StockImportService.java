package com.hospital.medicine.service;

import com.hospital.medicine.dto.request.StockImportDetailRequest;
import com.hospital.medicine.dto.request.StockImportRequest;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.dto.response.StockImportResponse;
import com.hospital.medicine.entity.*;
import com.hospital.medicine.entity.enums.TransactionStatus;
import com.hospital.medicine.exception.ResourceNotFoundException;
import com.hospital.medicine.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockImportService {

    private final StockImportRepository stockImportRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineBatchRepository batchRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public PageResponse<StockImportResponse> getAllImports(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<StockImport> page;
        if (startDate != null && endDate != null) {
            page = stockImportRepository.findByDateRange(startDate, endDate, pageable);
        } else {
            page = stockImportRepository.findAll(pageable);
        }
        return PageResponse.from(page, StockImportResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public StockImportResponse getImportById(Long id) {
        StockImport stockImport = stockImportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockImport", "id", id));
        return StockImportResponse.fromEntity(stockImport);
    }

    @Transactional
    public StockImportResponse createImport(StockImportRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        StockImport stockImport = new StockImport();
        stockImport.setImportCode(generateImportCode());
        stockImport.setImportDate(request.getImportDate());
        stockImport.setNotes(request.getNotes());
        stockImport.setImportedBy(user);
        stockImport.setStatus(TransactionStatus.COMPLETED);

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
            stockImport.setSupplier(supplier);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (StockImportDetailRequest detailRequest : request.getDetails()) {
            Medicine medicine = medicineRepository.findById(detailRequest.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", detailRequest.getMedicineId()));

            // Create or update batch
            MedicineBatch batch = batchRepository.findByMedicineIdAndBatchNumber(
                    medicine.getId(), detailRequest.getBatchNumber())
                    .orElseGet(() -> {
                        MedicineBatch newBatch = new MedicineBatch();
                        newBatch.setMedicine(medicine);
                        newBatch.setBatchNumber(detailRequest.getBatchNumber());
                        newBatch.setQuantity(0);
                        newBatch.setRemainingQuantity(0);
                        return newBatch;
                    });

            batch.setManufacturingDate(detailRequest.getManufacturingDate());
            batch.setExpiryDate(detailRequest.getExpiryDate());
            batch.setImportPrice(detailRequest.getUnitPrice());
            batch.setImportDate(LocalDate.now());
            batch.setQuantity(batch.getQuantity() + detailRequest.getQuantity());
            batch.setRemainingQuantity(batch.getRemainingQuantity() + detailRequest.getQuantity());
            batch = batchRepository.save(batch);

            // Create import detail
            StockImportDetail detail = new StockImportDetail();
            detail.setStockImport(stockImport);
            detail.setMedicine(medicine);
            detail.setBatch(batch);
            detail.setQuantity(detailRequest.getQuantity());
            detail.setUnitPrice(detailRequest.getUnitPrice());
            detail.setTotalPrice(detailRequest.getUnitPrice().multiply(BigDecimal.valueOf(detailRequest.getQuantity())));

            stockImport.getDetails().add(detail);
            totalAmount = totalAmount.add(detail.getTotalPrice());
        }

        stockImport.setTotalAmount(totalAmount);
        stockImport = stockImportRepository.save(stockImport);

        activityLogService.log(userId, "IMPORT", "StockImport", stockImport.getId(),
                "Created stock import: " + stockImport.getImportCode());

        return StockImportResponse.fromEntity(stockImport);
    }

    private String generateImportCode() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "IMP-" + date + "-" + uuid;
    }
}
