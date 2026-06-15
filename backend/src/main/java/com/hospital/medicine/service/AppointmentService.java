package com.hospital.medicine.service;

import com.hospital.medicine.entity.Appointment;
import com.hospital.medicine.entity.enums.AppointmentStatus;
import com.hospital.medicine.exception.ResourceNotFoundException;
import com.hospital.medicine.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

import com.hospital.medicine.dto.request.BookAppointmentRequest;
import com.hospital.medicine.entity.User;
import com.hospital.medicine.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<Appointment> getPatientAppointments(Long patientId, Pageable pageable) {
        return appointmentRepository.findByPatientId(patientId, pageable);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getUpcomingAppointments(Long patientId) {
        return appointmentRepository.findUpcomingAppointments(patientId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
    }

        @Transactional
        public Appointment createAppointment(Long patientId, BookAppointmentRequest request) {
        User patient = userRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", patientId));

        LocalDate date = LocalDate.parse(request.getDate());
        LocalTime time = LocalTime.parse(request.getTime());
        LocalDateTime appointmentDate = LocalDateTime.of(date, time);

        Appointment appointment = Appointment.builder()
            .patient(patient)
            .doctorName(request.getDoctorName())
            .department(request.getDepartment())
            .appointmentDate(appointmentDate)
            .notes(request.getNotes())
            .build();

        return appointmentRepository.save(appointment);
        }

    @Transactional
    public Appointment updateAppointmentStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }
}
