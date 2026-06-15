package com.hospital.medicine.dto.response;

import com.hospital.medicine.entity.StockExport;
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
public class StockExportResponse {
    private Long id;
    private String exportCode;
    private Long prescriptionId;
    private String prescriptionCode;
    private Long patientId;
    private String patientName;
    private Long exportedById;
    private String exportedByName;
    private LocalDateTime exportDate;
    private BigDecimal totalAmount;
    private String notes;
    private TransactionStatus status;
    private List<StockExportDetailResponse> details;
    private LocalDateTime createdAt;

    public static StockExportResponse fromEntity(StockExport stockExport) {
        StockExportResponse response = StockExportResponse.builder()
                .id(stockExport.getId())
                .exportCode(stockExport.getExportCode())
                .patientId(stockExport.getPatient().getId())
                .patientName(stockExport.getPatient().getFullName())
                .exportedById(stockExport.getExportedBy().getId())
                .exportedByName(stockExport.getExportedBy().getFullName())
                .exportDate(stockExport.getExportDate())
                .totalAmount(stockExport.getTotalAmount())
                .notes(stockExport.getNotes())
                .status(stockExport.getStatus())
                .createdAt(stockExport.getCreatedAt())
                .build();

        if (stockExport.getPrescription() != null) {
            response.setPrescriptionId(stockExport.getPrescription().getId());
            response.setPrescriptionCode(stockExport.getPrescription().getPrescriptionCode());
        }

        if (stockExport.getDetails() != null) {
            response.setDetails(stockExport.getDetails().stream()
                    .map(StockExportDetailResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        return response;
    }
}
