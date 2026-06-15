package com.hospital.medicine.dto.response;

import com.hospital.medicine.entity.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientMedicineRequestResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long medicineId;
    private String medicineName;
    private Integer quantity;
    private String reason;
    private RequestStatus status;
    private LocalDateTime processedAt;
    private Long processedById;
    private String processedByName;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

