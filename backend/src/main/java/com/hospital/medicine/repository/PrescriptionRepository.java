package com.hospital.medicine.repository;

import com.hospital.medicine.entity.Prescription;
import com.hospital.medicine.entity.enums.PrescriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Page<Prescription> findByPatientId(Long patientId, Pageable pageable);
    
    Page<Prescription> findByPatientIdAndStatus(Long patientId, PrescriptionStatus status, Pageable pageable);
    
    List<Prescription> findByPatientIdOrderByPrescriptionDateDesc(Long patientId);
    
    @Query("SELECT p FROM Prescription p WHERE p.status = :status ORDER BY p.prescriptionDate DESC")
    Page<Prescription> findByStatus(@Param("status") PrescriptionStatus status, Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.patient.id = :patientId")
    long countByPatientId(@Param("patientId") Long patientId);
}
