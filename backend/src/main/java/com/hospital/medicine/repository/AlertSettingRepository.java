package com.hospital.medicine.repository;

import com.hospital.medicine.entity.AlertSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertSettingRepository extends JpaRepository<AlertSetting, Long> {
    @Query("SELECT a FROM AlertSetting a WHERE a.isGlobal = true AND a.active = true")
    Optional<AlertSetting> findGlobalSetting();

    Optional<AlertSetting> findByMedicineIdAndActiveTrue(Long medicineId);

    // Added to match scheduler usage: return all active alert settings
    @Query("""
            select a from AlertSetting a
                    left join fetch a.medicine  m
                            left join fetch m.batches
            where a.active = true
            """)
    List<AlertSetting> findByActiveTrue();

    @Query("""
            select a from AlertSetting a
                    left join fetch a.medicine  m
                            left join fetch m.batches
            """)
    List<AlertSetting> findAllSetting();
}
