package com.hospital.medicine.service;

import com.hospital.medicine.dto.request.RegisterRequest;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.dto.request.UpdateProfileRequest;
import com.hospital.medicine.dto.response.UserResponse;
import com.hospital.medicine.entity.User;
import com.hospital.medicine.entity.enums.AuthProvider;
import com.hospital.medicine.entity.enums.Role;
import com.hospital.medicine.exception.BadRequestException;
import com.hospital.medicine.exception.ResourceNotFoundException;
import com.hospital.medicine.repository.AppointmentRepository;
import com.hospital.medicine.repository.PrescriptionRepository;
import com.hospital.medicine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final UserRepository userRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createPatient(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User patient = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(Role.PATIENT)
                .provider(AuthProvider.LOCAL)
                .enabled(true)
                .build();

        User saved = userRepository.save(patient);
        return UserResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllPatients(String search, Pageable pageable) {
        Page<User> page;
        if (search != null && !search.isEmpty()) {
            page = userRepository.searchPatients(Role.PATIENT, search, pageable);
        } else {
            page = userRepository.findByRole(Role.PATIENT, pageable);
        }
        return PageResponse.from(page, UserResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public UserResponse getPatientById(Long id) {
        User patient = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        return UserResponse.fromEntity(patient);
    }

    @Transactional
    public UserResponse updateProfile(Long id, UpdateProfileRequest request) {
        User patient = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        if (request.getName() != null) {
            patient.setFullName(request.getName());
        }
        if (request.getPhone() != null) {
            patient.setPhone(request.getPhone());
        }
        if (request.getAvatar() != null) {
            patient.setAvatarUrl(request.getAvatar());
        }
        User saved = userRepository.save(patient);
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public void deletePatient(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient", "id", id);
        }
        userRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long getPrescriptionCount(Long patientId) {
        return prescriptionRepository.countByPatientId(patientId);
    }
}
