package com.hospital.medicine.service;

import com.hospital.medicine.dto.request.AlertSettingRequest;
import com.hospital.medicine.entity.AlertSetting;
import com.hospital.medicine.entity.Medicine;
import com.hospital.medicine.entity.User;
import com.hospital.medicine.exception.ResourceNotFoundException;
import com.hospital.medicine.repository.AlertSettingRepository;
import com.hospital.medicine.repository.MedicineRepository;
import com.hospital.medicine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertSettingService {

    private final AlertSettingRepository alertSettingRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AlertSetting> getAllSettings() {
        return alertSettingRepository.findAllSetting();
    }

    @Transactional(readOnly = true)
    public AlertSetting getGlobalSetting() {
        return alertSettingRepository.findGlobalSetting()
                .orElse(AlertSetting.builder()
                        .minQuantityThreshold(50)
                        .expiryWarningDays(30)
                        .isGlobal(true)
                        .active(true)
                        .build());
    }

    @Transactional
    public AlertSetting saveGlobalSetting(AlertSettingRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        AlertSetting setting = alertSettingRepository.findGlobalSetting()
                .orElse(new AlertSetting());

        setting.setMinQuantityThreshold(request.getMinQuantityThreshold());
        setting.setExpiryWarningDays(request.getExpiryWarningDays());
        setting.setIsGlobal(true);
        setting.setActive(true);
        setting.setCreatedBy(user);

        return alertSettingRepository.save(setting);
    }

    @Transactional
    public AlertSetting saveMedicineSetting(AlertSettingRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", request.getMedicineId()));

        AlertSetting setting = alertSettingRepository.findByMedicineIdAndActiveTrue(medicine.getId())
                .orElse(new AlertSetting());

        setting.setMedicine(medicine);
        setting.setMinQuantityThreshold(request.getMinQuantityThreshold());
        setting.setExpiryWarningDays(request.getExpiryWarningDays());
        setting.setIsGlobal(false);
        setting.setActive(request.getActive());
        setting.setCreatedBy(user);

        return alertSettingRepository.save(setting);
    }

        @Transactional
        public AlertSetting updateSetting(Long id, AlertSettingRequest request, Long userId) {
                AlertSetting setting = alertSettingRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("AlertSetting", "id", id));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

                if (Boolean.TRUE.equals(request.getIsGlobal())) {
                        setting.setIsGlobal(true);
                        setting.setMedicine(null);
                } else {
                        if (request.getMedicineId() != null) {
                                Medicine medicine = medicineRepository.findById(request.getMedicineId())
                                                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", request.getMedicineId()));
                                setting.setMedicine(medicine);
                                setting.setIsGlobal(false);
                        }
                }

                if (request.getMinQuantityThreshold() != null) {
                        setting.setMinQuantityThreshold(request.getMinQuantityThreshold());
                }

                if (request.getExpiryWarningDays() != null) {
                        setting.setExpiryWarningDays(request.getExpiryWarningDays());
                }

                if (request.getActive() != null) {
                        setting.setActive(request.getActive());
                }

                setting.setCreatedBy(user);

                return alertSettingRepository.save(setting);
        }

        @Transactional
        public void deleteSetting(Long id, Long userId) {
                AlertSetting setting = alertSettingRepository.findById(id)
                                .orElseThrow(() -> new com.hospital.medicine.exception.ResourceNotFoundException("AlertSetting", "id", id));
                alertSettingRepository.delete(setting);
        }
}
