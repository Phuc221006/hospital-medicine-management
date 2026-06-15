package com.hospital.medicine.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class StockImportRequest {
    private Long supplierId;

    @NotNull(message = "Import date is required")
    private LocalDateTime importDate;

    private String notes;

    @NotEmpty(message = "Import details are required")
    @Valid
    private List<StockImportDetailRequest> details;
}
