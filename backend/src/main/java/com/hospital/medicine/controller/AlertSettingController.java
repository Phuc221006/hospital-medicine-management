package com.hospital.medicine.controller;

import com.hospital.medicine.dto.request.AlertSettingRequest;
import com.hospital.medicine.dto.response.AlertSettingResponse;
import com.hospital.medicine.dto.response.ApiResponse;
import com.hospital.medicine.entity.AlertSetting;
import com.hospital.medicine.security.UserPrincipal;
import com.hospital.medicine.service.AlertSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/alert-settings")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AlertSettingController {

    private final AlertSettingService alertSettingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AlertSettingResponse>>> getAllSettings() {
        List<AlertSetting> settings = alertSettingService.getAllSettings();
        List<AlertSettingResponse> response = settings.stream()
                .map(setting ->  {
                    AlertSettingResponse res = new AlertSettingResponse();
                    res.setId(setting.getId());
                    res.setMedicine(setting.getMedicine() != null ? setting.getMedicine().getName() : "Global Setting");
                    res.setMinQuantityThreshold(setting.getMinQuantityThreshold());
                    res.setExpiryWarningDays(setting.getExpiryWarningDays());
                    res.setIsGlobal(setting.getIsGlobal());
                    res.setActive(setting.getActive());
                    res.setCreatedAt(setting.getCreatedAt());
                    res.setUpdatedAt(setting.getUpdatedAt());
                    return res;
                })
                .toList();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/global")
    public ResponseEntity<ApiResponse<AlertSetting>> getGlobalSetting() {
        AlertSetting setting = alertSettingService.getGlobalSetting();
        return ResponseEntity.ok(ApiResponse.success(setting));
    }

    @PostMapping("/global")
    public ResponseEntity<ApiResponse<AlertSetting>> saveGlobalSetting(
            @Valid @RequestBody AlertSettingRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AlertSetting setting = alertSettingService.saveGlobalSetting(request, userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Global alert setting saved", setting));
    }

    @PostMapping("/medicine")
    public ResponseEntity<ApiResponse<AlertSetting>> saveMedicineSetting(
            @Valid @RequestBody AlertSettingRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AlertSetting setting = alertSettingService.saveMedicineSetting(request, userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Medicine alert setting saved", setting));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AlertSettingResponse>> updateSetting(
            @PathVariable Long id,
            @Valid @RequestBody AlertSettingRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AlertSetting setting = alertSettingService.updateSetting(id, request, userPrincipal.getUser().getId());

        AlertSettingResponse res = new AlertSettingResponse();
        res.setId(setting.getId());
        res.setMedicine(setting.getMedicine() != null ? setting.getMedicine().getName() : "Global Setting");
        res.setMinQuantityThreshold(setting.getMinQuantityThreshold());
        res.setExpiryWarningDays(setting.getExpiryWarningDays());
        res.setIsGlobal(setting.getIsGlobal());
        res.setActive(setting.getActive());
        res.setCreatedAt(setting.getCreatedAt());
        res.setUpdatedAt(setting.getUpdatedAt());

        return ResponseEntity.ok(ApiResponse.success("Alert setting updated", res));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSetting(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        alertSettingService.deleteSetting(id, userPrincipal.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Alert setting deleted"));
    }
}
