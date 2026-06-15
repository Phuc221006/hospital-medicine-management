package com.hospital.medicine.dto.response;

import com.hospital.medicine.entity.StockImportDetail;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockImportDetailResponse {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private Long batchId;
    private String batchNumber;
    private LocalDate expiryDate;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    public static StockImportDetailResponse fromEntity(StockImportDetail detail) {
        return StockImportDetailResponse.builder()
                .id(detail.getId())
                .medicineId(detail.getMedicine().getId())
                .medicineName(detail.getMedicine().getName())
                .medicineCode(detail.getMedicine().getCode())
                .batchId(detail.getBatch().getId())
                .batchNumber(detail.getBatch().getBatchNumber())
                .expiryDate(detail.getBatch().getExpiryDate())
                .quantity(detail.getQuantity())
                .unitPrice(detail.getUnitPrice())
                .totalPrice(detail.getTotalPrice())
                .build();
    }
}
