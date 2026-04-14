package com.pizza.restaurant.restaurant_backend.controller.admin;

import com.pizza.restaurant.restaurant_backend.model.Category;
import com.pizza.restaurant.restaurant_backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/categories")

public class AdminCategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private com.pizza.restaurant.restaurant_backend.service.FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Category> createCategory(
            @RequestPart("category") Category category,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            try {
                String imageKey = fileStorageService.saveFile(image, "categories");
                category.setImageKey(imageKey);
            } catch (java.io.IOException e) {
                return ResponseEntity.internalServerError().build();
            }
        }
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestPart("category") Category categoryDetails,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        if (categoryOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Category category = categoryOpt.get();
        category.setName(categoryDetails.getName());
        category.setSlug(categoryDetails.getSlug());

        if (image != null && !image.isEmpty()) {
            try {
                String imageKey = fileStorageService.saveFile(image, "categories");
                category.setImageKey(imageKey);
            } catch (java.io.IOException e) {
                return ResponseEntity.status(500).build();
            }
        } else if (categoryDetails.getImageKey() != null) {
            category.setImageKey(categoryDetails.getImageKey());
        }

        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

