package com.hospital.medicine.repository;

import com.hospital.medicine.entity.PatientMedicineRequest;
import com.hospital.medicine.entity.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientMedicineRequestRepository extends JpaRepository<PatientMedicineRequest, Long> {
    Page<PatientMedicineRequest> findByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);
    
    List<PatientMedicineRequest> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    
    Page<PatientMedicineRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status, Pageable pageable);
    
    Page<PatientMedicineRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

