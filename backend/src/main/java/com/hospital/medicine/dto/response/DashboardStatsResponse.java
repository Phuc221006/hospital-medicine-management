package com.hospital.medicine.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalMedicines;
    private long lowStockCount;
    private long expiredCount;
    private long expiringSoonCount;
    private long todayImportsCount;
    private long totalPatients;
    private Map<String, Integer> stockByCategory;
    private List<ActivityLogResponse> recentActivities;
}
