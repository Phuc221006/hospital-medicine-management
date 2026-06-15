package com.hospital.medicine.service;

import com.hospital.medicine.dto.response.ActivityLogResponse;
import com.hospital.medicine.dto.response.AlertResponse;
import com.hospital.medicine.dto.response.DashboardStatsResponse;
import com.hospital.medicine.entity.AlertSetting;
import com.hospital.medicine.entity.Medicine;
import com.hospital.medicine.entity.MedicineBatch;
import com.hospital.medicine.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MedicineRepository medicineRepository;
    private final MedicineBatchRepository batchRepository;
    private final StockImportRepository stockImportRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final AlertSettingRepository alertSettingRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        // Get global alert settings
        AlertSetting globalSetting = alertSettingRepository.findGlobalSetting()
                .orElse(AlertSetting.builder()
                        .minQuantityThreshold(50)
                        .expiryWarningDays(30)
                        .build());

        int threshold = globalSetting.getMinQuantityThreshold();
        int warningDays = globalSetting.getExpiryWarningDays();

        // Count statistics
        long totalMedicines = medicineRepository.countActive();
        long lowStockCount = batchRepository.findLowStockBatches(threshold).size();
        long expiredCount = batchRepository.findExpiredBatches(LocalDate.now()).size();
        long expiringSoonCount = batchRepository.findExpiringSoonBatches(
                LocalDate.now(), LocalDate.now().plusDays(warningDays)).size();
        long todayImportsCount = stockImportRepository.countTodayImports(startOfDay, endOfDay);
        long totalPatients = userRepository.countPatients();

        // Stock by category
        Map<String, Integer> stockByCategory = new HashMap<>();
        List<Medicine> medicines = medicineRepository.findAllWithBatches();
        for (Medicine medicine : medicines) {
            String categoryName = medicine.getCategory() != null ? medicine.getCategory().getName() : "Khác";
            int stock = medicine.getTotalStock();
            stockByCategory.merge(categoryName, stock, Integer::sum);
        }

        // Recent activities
        List<ActivityLogResponse> recentActivities = activityLogRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10))
                .getContent()
                .stream()
                .map(ActivityLogResponse::fromEntity)
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalMedicines(totalMedicines)
                .lowStockCount(lowStockCount)
                .expiredCount(expiredCount)
                .expiringSoonCount(expiringSoonCount)
                .todayImportsCount(todayImportsCount)
                .totalPatients(totalPatients)
                .stockByCategory(stockByCategory)
                .recentActivities(recentActivities)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getAlerts() {
        List<AlertResponse> alerts = new ArrayList<>();

        AlertSetting globalSetting = alertSettingRepository.findGlobalSetting()
                .orElse(AlertSetting.builder()
                        .minQuantityThreshold(50)
                        .expiryWarningDays(30)
                        .build());

        int threshold = globalSetting.getMinQuantityThreshold();
        int warningDays = globalSetting.getExpiryWarningDays();

        // Low stock alerts
        List<MedicineBatch> lowStockBatches = batchRepository.findLowStockBatches(threshold);
        for (MedicineBatch batch : lowStockBatches) {
            alerts.add(AlertResponse.builder()
                    .medicineId(batch.getMedicine().getId())
                    .medicineName(batch.getMedicine().getName())
                    .medicineCode(batch.getMedicine().getCode())
                    .alertType("LOW_STOCK")
                    .currentStock(batch.getRemainingQuantity())
                    .threshold(threshold)
                    .batchNumber(batch.getBatchNumber())
                    .build());
        }

        // Expired alerts
        List<MedicineBatch> expiredBatches = batchRepository.findExpiredBatches(LocalDate.now());
        for (MedicineBatch batch : expiredBatches) {
            alerts.add(AlertResponse.builder()
                    .medicineId(batch.getMedicine().getId())
                    .medicineName(batch.getMedicine().getName())
                    .medicineCode(batch.getMedicine().getCode())
                    .alertType("EXPIRED")
                    .expiryDate(batch.getExpiryDate())
                    .daysUntilExpiry((int) ChronoUnit.DAYS.between(LocalDate.now(), batch.getExpiryDate()))
                    .batchNumber(batch.getBatchNumber())
                    .build());
        }

        // Expiring soon alerts
        List<MedicineBatch> expiringSoonBatches = batchRepository.findExpiringSoonBatches(
                LocalDate.now(), LocalDate.now().plusDays(warningDays));
        for (MedicineBatch batch : expiringSoonBatches) {
            alerts.add(AlertResponse.builder()
                    .medicineId(batch.getMedicine().getId())
                    .medicineName(batch.getMedicine().getName())
                    .medicineCode(batch.getMedicine().getCode())
                    .alertType("EXPIRING_SOON")
                    .expiryDate(batch.getExpiryDate())
                    .daysUntilExpiry((int) ChronoUnit.DAYS.between(LocalDate.now(), batch.getExpiryDate()))
                    .batchNumber(batch.getBatchNumber())
                    .build());
        }

        return alerts;
    }
}
