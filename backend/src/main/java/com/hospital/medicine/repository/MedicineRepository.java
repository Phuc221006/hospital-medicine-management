package com.hospital.medicine.repository;

import com.hospital.medicine.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findByCode(String code);
    
    boolean existsByCode(String code);
    
    @Query("SELECT m FROM Medicine m WHERE m.active = true AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND m.active = true")
    Page<Medicine> search(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT m FROM Medicine m WHERE m.active = true AND m.category.id = :categoryId AND m.active = true")
    Page<Medicine> findByCategory(@Param("categoryId") Long categoryId, Pageable pageable);
    
    @Query("SELECT m FROM Medicine m WHERE m.active = true AND m.supplier.id = :supplierId AND m.active = true")
    Page<Medicine> findBySupplier(@Param("supplierId") Long supplierId, Pageable pageable);
    
    @Query("SELECT m FROM Medicine m LEFT JOIN FETCH m.batches WHERE m.active = true")
    List<Medicine> findAllWithBatches();
    
    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.active = true")
    long countActive();
    
    @Query("SELECT m FROM Medicine m WHERE m.active = true AND LOWER(m.name) = LOWER(:name)")
    List<Medicine> findByName(@Param("name") String name);

    Page<Medicine> findAllByActiveIsTrue(Pageable pageable);
}
