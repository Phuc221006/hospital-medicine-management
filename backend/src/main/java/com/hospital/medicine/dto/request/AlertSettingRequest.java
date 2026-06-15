package com.hospital.medicine.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class AlertSettingRequest {
    private Long medicineId;

    @Min(value = 1, message = "Min quantity threshold must be at least 1")
    private Integer minQuantityThreshold = 10;

    @Min(value = 1, message = "Expiry warning days must be at least 1")
    private Integer expiryWarningDays = 30;

    private Boolean isGlobal = false;
    private Boolean active = true;
}
