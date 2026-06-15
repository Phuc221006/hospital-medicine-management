package com.hospital.medicine.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private String alertType; // LOW_STOCK, EXPIRING_SOON, EXPIRED
    private Integer currentStock;
    private Integer threshold;
    private LocalDate expiryDate;
    private Integer daysUntilExpiry;
    private String batchNumber;
}
