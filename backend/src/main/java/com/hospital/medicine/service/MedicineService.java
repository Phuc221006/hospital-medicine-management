package com.hospital.medicine.service;

import com.hospital.medicine.dto.request.MedicineRequest;
import com.hospital.medicine.dto.response.MedicineResponse;
import com.hospital.medicine.dto.response.PageResponse;
import com.hospital.medicine.entity.Medicine;
import com.hospital.medicine.entity.MedicineCategory;
import com.hospital.medicine.entity.Supplier;
import com.hospital.medicine.exception.BadRequestException;
import com.hospital.medicine.exception.ResourceNotFoundException;
import com.hospital.medicine.repository.MedicineCategoryRepository;
import com.hospital.medicine.repository.MedicineRepository;
import com.hospital.medicine.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.hospital.medicine.entity.MedicineBatch;
import com.hospital.medicine.dto.response.MedicineBatchResponse;
import com.hospital.medicine.repository.MedicineBatchRepository;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final MedicineCategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineBatchRepository batchRepository;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public PageResponse<MedicineResponse> getAllMedicines(String search, Long categoryId, Long supplierId, Pageable pageable) {
        Page<Medicine> page;

        if (search != null && !search.isEmpty()) {
            page = medicineRepository.search(search, pageable);
        } else if (categoryId != null) {
            page = medicineRepository.findByCategory(categoryId, pageable);
        } else if (supplierId != null) {
            page = medicineRepository.findBySupplier(supplierId, pageable);
        } else {
            page = medicineRepository.findAllByActiveIsTrue(pageable);
        }

        return PageResponse.from(page, MedicineResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<MedicineBatchResponse> getBatches(Long medicineId) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", medicineId));

        List<MedicineBatch> batches = batchRepository.findByMedicineIdOrderByExpiryDateAsc(medicineId);
        return batches.stream().map(MedicineBatchResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
        return MedicineResponse.fromEntity(medicine);
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getAllMedicinesForSelect() {
        return medicineRepository.findAll().stream()
                .filter(Medicine::getActive)
                .map(MedicineResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request, Long userId) {
        if (medicineRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Medicine code already exists");
        }

        Medicine medicine = new Medicine();
        mapRequestToEntity(request, medicine);
        medicine = medicineRepository.save(medicine);

        activityLogService.log(userId, "CREATE", "Medicine", medicine.getId(),
                "Created medicine: " + medicine.getName());

        return MedicineResponse.fromEntity(medicine);
    }

    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request, Long userId) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));

        if (!medicine.getCode().equals(request.getCode()) && medicineRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Medicine code already exists");
        }

        mapRequestToEntity(request, medicine);
        medicine = medicineRepository.save(medicine);

        activityLogService.log(userId, "UPDATE", "Medicine", medicine.getId(),
                "Updated medicine: " + medicine.getName());

        return MedicineResponse.fromEntity(medicine);
    }

    @Transactional
    public void deleteMedicine(Long id, Long userId) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));

        medicine.setActive(false);
        medicineRepository.save(medicine);

        activityLogService.log(userId, "DELETE", "Medicine", medicine.getId(),
                "Deleted medicine: " + medicine.getName());
    }

    private void mapRequestToEntity(MedicineRequest request, Medicine medicine) {
        medicine.setCode(request.getCode());
        medicine.setName(request.getName());
        medicine.setGenericName(request.getGenericName());
        medicine.setUnit(request.getUnit());
        medicine.setPrice(request.getPrice());
        medicine.setDescription(request.getDescription());
        medicine.setUsageInstructions(request.getUsageInstructions());
        medicine.setSideEffects(request.getSideEffects());
        medicine.setContraindications(request.getContraindications());
        medicine.setStorageConditions(request.getStorageConditions());
        medicine.setRequiresPrescription(request.getRequiresPrescription());

        if (request.getCategoryId() != null) {
            MedicineCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            medicine.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
            medicine.setSupplier(supplier);
        }
    }
}
