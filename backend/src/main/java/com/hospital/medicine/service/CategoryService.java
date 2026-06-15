package com.hospital.medicine.service;

import com.hospital.medicine.entity.MedicineCategory;
import com.hospital.medicine.exception.BadRequestException;
import com.hospital.medicine.exception.ResourceNotFoundException;
import com.hospital.medicine.repository.MedicineCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final MedicineCategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<MedicineCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public MedicineCategory getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Transactional
    public MedicineCategory createCategory(String name, String description) {
        if (categoryRepository.existsByName(name)) {
            throw new BadRequestException("Category name already exists");
        }

        MedicineCategory category = MedicineCategory.builder()
                .name(name)
                .description(description)
                .build();

        return categoryRepository.save(category);
    }

    @Transactional
    public MedicineCategory updateCategory(Long id, String name, String description) {
        MedicineCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (!category.getName().equals(name) && categoryRepository.existsByName(name)) {
            throw new BadRequestException("Category name already exists");
        }

        category.setName(name);
        category.setDescription(description);

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        MedicineCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }
}
