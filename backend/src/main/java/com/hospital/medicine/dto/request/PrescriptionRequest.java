package com.hospital.medicine.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PrescriptionRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Doctor name is required")
    private String doctorName;

    private String diagnosis;

    @NotNull(message = "Prescription date is required")
    private LocalDateTime prescriptionDate;

    private String notes;

    @NotEmpty(message = "Prescription details are required")
    @Valid
    private List<PrescriptionDetailRequest> details;
}
