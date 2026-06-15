package com.hospital.medicine.dto.response;

import com.hospital.medicine.entity.StockExportDetail;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockExportDetailResponse {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private Long batchId;
    private String batchNumber;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    public static StockExportDetailResponse fromEntity(StockExportDetail detail) {
        return StockExportDetailResponse.builder()
                .id(detail.getId())
                .medicineId(detail.getMedicine().getId())
                .medicineName(detail.getMedicine().getName())
                .medicineCode(detail.getMedicine().getCode())
                .batchId(detail.getBatch().getId())
                .batchNumber(detail.getBatch().getBatchNumber())
                .quantity(detail.getQuantity())
                .unitPrice(detail.getUnitPrice())
                .totalPrice(detail.getTotalPrice())
                .build();
    }
}
