package com.hospital.medicine.scheduler;

import com.hospital.medicine.entity.AlertSetting;
import com.hospital.medicine.entity.Medicine;
import com.hospital.medicine.entity.MedicineBatch;
import com.hospital.medicine.entity.Notification;
import com.hospital.medicine.repository.AlertSettingRepository;
import com.hospital.medicine.repository.MedicineBatchRepository;
import com.hospital.medicine.repository.NotificationRepository;
import com.hospital.medicine.service.WebSocketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@EnableScheduling
public class AlertScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AlertScheduler.class);

    private final MedicineBatchRepository batchRepository;
    private final AlertSettingRepository alertSettingRepository;
    private final NotificationRepository notificationRepository;
    private final WebSocketService webSocketService;

    public AlertScheduler(
            MedicineBatchRepository batchRepository,
            AlertSettingRepository alertSettingRepository,
            NotificationRepository notificationRepository,
            WebSocketService webSocketService) {
        this.batchRepository = batchRepository;
        this.alertSettingRepository = alertSettingRepository;
        this.notificationRepository = notificationRepository;
        this.webSocketService = webSocketService;
    }

    // Run every hour
    @Scheduled(fixedRate = 3600000)
    public void checkStockLevels() {
        logger.info("Checking stock levels...");

        // Use repository method that returns all active settings
        List<AlertSetting> activeSettings = alertSettingRepository.findByActiveTrue();

        for (AlertSetting setting : activeSettings) {
            Medicine medicine = setting.getMedicine();

            if (medicine == null) {
                logger.warn("Skipping AlertSetting id={} because no medicine is associated (isGlobal={})",
                        setting.getId(), setting.getIsGlobal());
                continue;
            }

            Integer totalStock = medicine.getTotalStock();
            if (totalStock == null) {
                logger.warn("Medicine id={} (name={}) has null totalStock, treating as 0",
                        medicine.getId(), medicine.getName());
                totalStock = 0;
            }

            Integer threshold = setting.getMinQuantityThreshold() != null ? setting.getMinQuantityThreshold() : 0;

            // Check low stock - use Medicine#getTotalStock()
            if (totalStock <= threshold) {
                createLowStockAlert(medicine, threshold);
            }
        }
    }

    // Run daily at 8 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void checkExpiringBatches() {
        logger.info("Checking expiring batches...");

        List<AlertSetting> activeSettings = alertSettingRepository.findByActiveTrue();

        for (AlertSetting setting : activeSettings) {
            Integer expiryDays = setting.getExpiryWarningDays() != null ? setting.getExpiryWarningDays() : 0;
            LocalDate warningDate = LocalDate.now().plusDays(expiryDays);

            Medicine settingMedicine = setting.getMedicine();
            if (settingMedicine == null) {
            logger.warn("Skipping expiry check for AlertSetting id={} because no medicine is associated (isGlobal={})",
                setting.getId(), setting.getIsGlobal());
            continue;
            }

            List<MedicineBatch> expiringBatches = batchRepository
                .findByMedicineIdAndExpiryDateBeforeAndRemainingQuantityGreaterThan(
                    settingMedicine.getId(),
                    warningDate,
                    0);

            for (MedicineBatch batch : expiringBatches) {
                createExpiringAlert(batch);
            }
        }
    }

    private void createLowStockAlert(Medicine medicine, int threshold) {
        // Check if alert already exists for today
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        boolean alertExists = notificationRepository.existsByMedicine_IdAndTypeAndCreatedAtAfter(
                medicine.getId(), com.hospital.medicine.entity.enums.NotificationType.LOW_STOCK, todayStart);

        if (!alertExists) {
            Notification notification = new Notification();
            notification.setTitle("Thuốc sắp hết");
            notification.setMessage(String.format("Thuốc %s còn %d %s (ngưỡng: %d)",
                    medicine.getName(), medicine.getTotalStock(), medicine.getUnit(), threshold));
            notification.setType(com.hospital.medicine.entity.enums.NotificationType.LOW_STOCK);
            notification.setMedicine(medicine);
            notification.setCreatedAt(LocalDateTime.now());
            
            notificationRepository.save(notification);

            // Send WebSocket notification
            Map<String, Object> alertData = new HashMap<>();
            alertData.put("medicineId", medicine.getId());
            alertData.put("medicineName", medicine.getName());
            alertData.put("currentQuantity", medicine.getTotalStock());
            alertData.put("threshold", threshold);
            
            webSocketService.sendStockLowAlert(alertData);
            
            logger.info("Created low stock alert for medicine: {}", medicine.getName());
        }
    }

    private void createExpiringAlert(MedicineBatch batch) {
        // Check if alert already exists for this batch
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        boolean alertExists = notificationRepository.existsByBatch_IdAndTypeAndCreatedAtAfter(
                batch.getId(), com.hospital.medicine.entity.enums.NotificationType.EXPIRING_SOON, todayStart);

        if (!alertExists) {
            Notification notification = new Notification();
            notification.setTitle("Thuốc sắp hết hạn");
            notification.setMessage(String.format("Lô %s của thuốc %s sẽ hết hạn ngày %s",
                    batch.getBatchNumber(), batch.getMedicine().getName(), batch.getExpiryDate()));
            notification.setType(com.hospital.medicine.entity.enums.NotificationType.EXPIRING_SOON);
            notification.setMedicine(batch.getMedicine());
            notification.setBatch(batch);
            notification.setCreatedAt(LocalDateTime.now());
            
            notificationRepository.save(notification);

            // Send WebSocket notification
            Map<String, Object> alertData = new HashMap<>();
            alertData.put("medicineId", batch.getMedicine().getId());
            alertData.put("medicineName", batch.getMedicine().getName());
            alertData.put("batchNumber", batch.getBatchNumber());
            alertData.put("expiryDate", batch.getExpiryDate().toString());
            alertData.put("quantity", batch.getRemainingQuantity());

            webSocketService.sendExpiringStockAlert(alertData);
            
            logger.info("Created expiring alert for batch: {}", batch.getBatchNumber());
        }
    }
}
