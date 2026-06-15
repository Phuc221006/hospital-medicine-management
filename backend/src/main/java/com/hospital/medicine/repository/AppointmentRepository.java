package com.hospital.medicine.repository;

import com.hospital.medicine.entity.Appointment;
import com.hospital.medicine.entity.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);
    
    List<Appointment> findByPatientIdAndStatusOrderByAppointmentDateAsc(Long patientId, AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.appointmentDate >= :fromDate ORDER BY a.appointmentDate ASC")
    List<Appointment> findUpcomingAppointments(@Param("patientId") Long patientId, @Param("fromDate") LocalDateTime fromDate);
}
