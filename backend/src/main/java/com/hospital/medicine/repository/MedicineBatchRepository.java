package com.hospital.medicine.repository;

import com.hospital.medicine.entity.MedicineBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineBatchRepository extends JpaRepository<MedicineBatch, Long> {
    List<MedicineBatch> findByMedicineIdOrderByExpiryDateAsc(Long medicineId);
    
    Optional<MedicineBatch> findByMedicineIdAndBatchNumber(Long medicineId, String batchNumber);
    
    @Query("SELECT mb FROM MedicineBatch mb WHERE mb.remainingQuantity > 0 AND mb.expiryDate > :today " +
           "AND mb.medicine.id = :medicineId ORDER BY mb.expiryDate ASC")
    List<MedicineBatch> findAvailableBatches(@Param("medicineId") Long medicineId, @Param("today") LocalDate today);
    
    @Query("SELECT mb FROM MedicineBatch mb WHERE mb.expiryDate <= :date AND mb.remainingQuantity > 0")
    List<MedicineBatch> findExpiredBatches(@Param("date") LocalDate date);
    
    @Query("SELECT mb FROM MedicineBatch mb WHERE mb.expiryDate > :today AND mb.expiryDate <= :warningDate AND mb.remainingQuantity > 0")
    List<MedicineBatch> findExpiringSoonBatches(@Param("today") LocalDate today, @Param("warningDate") LocalDate warningDate);
    
    @Query("SELECT mb FROM MedicineBatch mb WHERE mb.remainingQuantity <= :threshold AND mb.remainingQuantity > 0")
    List<MedicineBatch> findLowStockBatches(@Param("threshold") int threshold);
    
    @Query("SELECT COALESCE(SUM(mb.remainingQuantity), 0) FROM MedicineBatch mb WHERE mb.medicine.id = :medicineId AND mb.expiryDate > :today")
    Integer getTotalStock(@Param("medicineId") Long medicineId, @Param("today") LocalDate today);

    // Added: find expiring batches for a specific medicine before a date and with remainingQuantity > :qty
    List<MedicineBatch> findByMedicineIdAndExpiryDateBeforeAndRemainingQuantityGreaterThan(Long medicineId, LocalDate date, int qty);
}
