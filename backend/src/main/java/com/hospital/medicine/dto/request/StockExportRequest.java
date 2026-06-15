package com.hospital.medicine.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class StockExportRequest {
    private Long prescriptionId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Export date is required")
    private LocalDateTime exportDate;

    private String notes;

    @NotEmpty(message = "Export details are required")
    @Valid
    private List<StockExportDetailRequest> details;
}
