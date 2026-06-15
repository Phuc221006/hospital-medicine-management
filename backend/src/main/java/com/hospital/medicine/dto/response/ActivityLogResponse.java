package com.hospital.medicine.dto.response;

import com.hospital.medicine.entity.ActivityLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String action;
    private String entityType;
    private Long entityId;
    private String description;
    private LocalDateTime createdAt;

    public static ActivityLogResponse fromEntity(ActivityLog log) {
        ActivityLogResponse response = ActivityLogResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .description(log.getDescription())
                .createdAt(log.getCreatedAt())
                .build();

        if (log.getUser() != null) {
            response.setUserId(log.getUser().getId());
            response.setUserName(log.getUser().getFullName());
        }

        return response;
    }
}
