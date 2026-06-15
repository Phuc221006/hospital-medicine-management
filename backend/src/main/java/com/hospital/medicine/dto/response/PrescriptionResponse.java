package com.hospital.medicine.dto.response;

import com.hospital.medicine.entity.Prescription;
import com.hospital.medicine.entity.enums.PrescriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponse {
    private Long id;
    private String prescriptionCode;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String doctorName;
    private String diagnosis;
    private LocalDateTime prescriptionDate;
    private PrescriptionStatus status;
    private String notes;
    private Long dispensedById;
    private String dispensedByName;
    private LocalDateTime dispensedAt;
    private List<PrescriptionDetailResponse> details;
    private LocalDateTime createdAt;

    public static PrescriptionResponse fromEntity(Prescription prescription) {
        PrescriptionResponse response = PrescriptionResponse.builder()
                .id(prescription.getId())
                .prescriptionCode(prescription.getPrescriptionCode())
                .patientId(prescription.getPatient().getId())
                .patientName(prescription.getPatient().getFullName())
                .patientEmail(prescription.getPatient().getEmail())
                .doctorName(prescription.getDoctorName())
                .diagnosis(prescription.getDiagnosis())
                .prescriptionDate(prescription.getPrescriptionDate())
                .status(prescription.getStatus())
                .notes(prescription.getNotes())
                .dispensedAt(prescription.getDispensedAt())
                .createdAt(prescription.getCreatedAt())
                .build();

        if (prescription.getDispensedBy() != null) {
            response.setDispensedById(prescription.getDispensedBy().getId());
            response.setDispensedByName(prescription.getDispensedBy().getFullName());
        }

        if (prescription.getDetails() != null) {
            response.setDetails(prescription.getDetails().stream()
                    .map(PrescriptionDetailResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        return response;
    }
}
