package com.hospital.medicine.dto.response;

import com.hospital.medicine.entity.StockImport;
import com.hospital.medicine.entity.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockImportResponse {
    private Long id;
    private String importCode;
    private Long supplierId;
    private String supplierName;
    private Long importedById;
    private String importedByName;
    private LocalDateTime importDate;
    private BigDecimal totalAmount;
    private String notes;
    private TransactionStatus status;
    private List<StockImportDetailResponse> details;
    private LocalDateTime createdAt;

    public static StockImportResponse fromEntity(StockImport stockImport) {
        StockImportResponse response = StockImportResponse.builder()
                .id(stockImport.getId())
                .importCode(stockImport.getImportCode())
                .importedById(stockImport.getImportedBy().getId())
                .importedByName(stockImport.getImportedBy().getFullName())
                .importDate(stockImport.getImportDate())
                .totalAmount(stockImport.getTotalAmount())
                .notes(stockImport.getNotes())
                .status(stockImport.getStatus())
                .createdAt(stockImport.getCreatedAt())
                .build();

        if (stockImport.getSupplier() != null) {
            response.setSupplierId(stockImport.getSupplier().getId());
            response.setSupplierName(stockImport.getSupplier().getName());
        }

        if (stockImport.getDetails() != null) {
            response.setDetails(stockImport.getDetails().stream()
                    .map(StockImportDetailResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        return response;
    }
}
