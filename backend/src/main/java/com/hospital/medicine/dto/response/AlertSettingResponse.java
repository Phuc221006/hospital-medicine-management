package com.hospital.medicine.dto.response;

import com.hospital.medicine.entity.Medicine;
import com.hospital.medicine.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AlertSettingResponse {
    private Long id;
    private String medicine;
    private Integer minQuantityThreshold;
    private Integer expiryWarningDays;
    private Boolean isGlobal;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
