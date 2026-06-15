package com.hospital.medicine.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MedicineRequest {
    @NotBlank(message = "Medicine code is required")
    private String code;

    @NotBlank(message = "Medicine name is required")
    private String name;

    private String genericName;

    private Long categoryId;

    private Long supplierId;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0", message = "Price must be positive")
    private BigDecimal price;

    private String description;
    private String usageInstructions;
    private String sideEffects;
    private String contraindications;
    private String storageConditions;
    private Boolean requiresPrescription = false;
}
