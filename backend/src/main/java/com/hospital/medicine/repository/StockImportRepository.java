package com.hospital.medicine.repository;

import com.hospital.medicine.entity.StockImport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockImportRepository extends JpaRepository<StockImport, Long> {
    @Query("SELECT si FROM StockImport si WHERE si.importDate BETWEEN :startDate AND :endDate ORDER BY si.importDate DESC")
    Page<StockImport> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate, 
                                       Pageable pageable);
    
    @Query("SELECT si FROM StockImport si WHERE si.importDate >= :startOfDay AND si.importDate < :endOfDay")
    List<StockImport> findTodayImports(@Param("startOfDay") LocalDateTime startOfDay, 
                                        @Param("endOfDay") LocalDateTime endOfDay);
    
    @Query("SELECT COUNT(si) FROM StockImport si WHERE si.importDate >= :startOfDay AND si.importDate < :endOfDay")
    long countTodayImports(@Param("startOfDay") LocalDateTime startOfDay, 
                           @Param("endOfDay") LocalDateTime endOfDay);
}
