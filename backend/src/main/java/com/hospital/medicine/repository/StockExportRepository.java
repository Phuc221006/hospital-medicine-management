package com.hospital.medicine.repository;

import com.hospital.medicine.entity.StockExport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface StockExportRepository extends JpaRepository<StockExport, Long> {
    Page<StockExport> findByPatientId(Long patientId, Pageable pageable);
    
    @Query("SELECT se FROM StockExport se WHERE se.exportDate BETWEEN :startDate AND :endDate ORDER BY se.exportDate DESC")
    Page<StockExport> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate,
                                       Pageable pageable);
}
