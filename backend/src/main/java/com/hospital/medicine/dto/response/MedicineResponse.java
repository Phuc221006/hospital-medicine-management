package com.hospital.medicine.dto.response;

import com.hospital.medicine.entity.Medicine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineResponse {
    private Long id;
    private String code;
    private String name;
    private String genericName;
    private Long categoryId;
    private String categoryName;
    private Long supplierId;
    private String supplierName;
    private String unit;
    private BigDecimal price;
    private String description;
    private String usageInstructions;
    private String sideEffects;
    private String contraindications;
    private String storageConditions;
    private Boolean requiresPrescription;
    private Boolean active;
    private Integer totalStock;
    private LocalDate nearestExpiryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MedicineResponse fromEntity(Medicine medicine) {
        MedicineResponse response = MedicineResponse.builder()
                .id(medicine.getId())
                .code(medicine.getCode())
                .name(medicine.getName())
                .genericName(medicine.getGenericName())
                .unit(medicine.getUnit())
                .price(medicine.getPrice())
                .description(medicine.getDescription())
                .usageInstructions(medicine.getUsageInstructions())
                .sideEffects(medicine.getSideEffects())
                .contraindications(medicine.getContraindications())
                .storageConditions(medicine.getStorageConditions())
                .requiresPrescription(medicine.getRequiresPrescription())
                .active(medicine.getActive())
                .totalStock(medicine.getTotalStock())
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();

        if (medicine.getCategory() != null) {
            response.setCategoryId(medicine.getCategory().getId());
            response.setCategoryName(medicine.getCategory().getName());
        }
        if (medicine.getSupplier() != null) {
            response.setSupplierId(medicine.getSupplier().getId());
            response.setSupplierName(medicine.getSupplier().getName());
        }
        if (!medicine.getBatches().isEmpty()) {
            medicine.getBatches().stream()
                    .filter(b -> b.getRemainingQuantity() > 0)
                    .map(b -> b.getExpiryDate())
                    .min(LocalDate::compareTo)
                    .ifPresent(response::setNearestExpiryDate);
        }

        return response;
    }
}
