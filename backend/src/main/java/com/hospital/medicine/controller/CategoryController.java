package com.hospital.medicine.controller;

import com.hospital.medicine.dto.response.ApiResponse;
import com.hospital.medicine.entity.MedicineCategory;
import com.hospital.medicine.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicineCategory>>> getAllCategories() {
        List<MedicineCategory> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineCategory>> getCategoryById(@PathVariable Long id) {
        MedicineCategory category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicineCategory>> createCategory(@RequestBody Map<String, String> request) {
        MedicineCategory category = categoryService.createCategory(
                request.get("name"),
                request.get("description")
        );
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineCategory>> updateCategory(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        MedicineCategory category = categoryService.updateCategory(
                id,
                request.get("name"),
                request.get("description")
        );
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}
