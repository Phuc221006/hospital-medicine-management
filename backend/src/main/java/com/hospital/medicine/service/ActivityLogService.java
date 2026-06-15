package com.hospital.medicine.service;

import com.hospital.medicine.dto.response.ActivityLogResponse;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.entity.ActivityLog;
import com.hospital.medicine.entity.User;
import com.hospital.medicine.repository.ActivityLogRepository;
import com.hospital.medicine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void log(Long userId, String action, String entityType, Long entityId, String description) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        ActivityLog log = ActivityLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .build();

        activityLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivityLogResponse> getActivityLogs(Pageable pageable) {
        Page<ActivityLog> page = activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.from(page, ActivityLogResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivityLogResponse> getUserActivityLogs(Long userId, Pageable pageable) {
        Page<ActivityLog> page = activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PageResponse.from(page, ActivityLogResponse::fromEntity);
    }
}
