package com.hospital.medicine.dto.response;

import com.hospital.medicine.entity.MedicineBatch;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineBatchResponse {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String batchNumber;
    private Integer quantity;
    private Integer remainingQuantity;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    private BigDecimal importPrice;
    private LocalDate importDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MedicineBatchResponse fromEntity(MedicineBatch batch) {
        if (batch == null) return null;

        MedicineBatchResponse resp = MedicineBatchResponse.builder()
                .id(batch.getId())
                .batchNumber(batch.getBatchNumber())
                .quantity(batch.getQuantity())
                .remainingQuantity(batch.getRemainingQuantity())
                .manufacturingDate(batch.getManufacturingDate())
                .expiryDate(batch.getExpiryDate())
                .importPrice(batch.getImportPrice())
                .importDate(batch.getImportDate())
                .notes(batch.getNotes())
                .createdAt(batch.getCreatedAt())
                .updatedAt(batch.getUpdatedAt())
                .build();

        if (batch.getMedicine() != null) {
            resp.setMedicineId(batch.getMedicine().getId());
            resp.setMedicineName(batch.getMedicine().getName());
        }

        return resp;
    }
}
