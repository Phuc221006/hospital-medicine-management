package com.hospital.medicine.repository;

import com.hospital.medicine.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    long countUnread(@Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId")
    void markAllAsRead(@Param("userId") Long userId);

    // Use nested property traversal for derived queries (medicine.id and batch.id)
    boolean existsByMedicine_IdAndTypeAndCreatedAtAfter(Long medicineId, com.hospital.medicine.entity.enums.NotificationType type, java.time.LocalDateTime after);

    boolean existsByBatch_IdAndTypeAndCreatedAtAfter(Long batchId, com.hospital.medicine.entity.enums.NotificationType type, java.time.LocalDateTime after);
}
