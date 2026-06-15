package com.hospital.medicine.dto.response;

import com.hospital.medicine.entity.PrescriptionDetail;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDetailResponse {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private Integer quantity;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;

    public static PrescriptionDetailResponse fromEntity(PrescriptionDetail detail) {
        return PrescriptionDetailResponse.builder()
                .id(detail.getId())
                .medicineId(detail.getMedicine().getId())
                .medicineName(detail.getMedicine().getName())
                .medicineCode(detail.getMedicine().getCode())
                .quantity(detail.getQuantity())
                .dosage(detail.getDosage())
                .frequency(detail.getFrequency())
                .duration(detail.getDuration())
                .instructions(detail.getInstructions())
                .build();
    }
}
