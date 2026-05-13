package com.pizza.restaurant.restaurant_backend.controller.admin;

import com.pizza.restaurant.restaurant_backend.api.admin.AdminProductApi;
import com.pizza.restaurant.restaurant_backend.model.Product;
import com.pizza.restaurant.restaurant_backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController

public class AdminProductController implements AdminProductApi {

    @Autowired
    private ProductService productService;

    @Autowired
    private com.pizza.restaurant.restaurant_backend.service.FileStorageService fileStorageService;

    // ─── GET: List all (with optional category filter) ────────────────────────
    @Override
    public ResponseEntity<List<Product>> getAllProducts(String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(productService.getProductsByCategory(category));
        }
        return ResponseEntity.ok(productService.getAll());
    }

    // ─── GET: By ID ────────────────────────────────────────────────────────────
    @Override
    public ResponseEntity<Product> getProductById(Long id) {
        Product product = productService.findById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }

    // ─── POST: Create ─────────────────────────────────────────────────────────
    @Override
    public ResponseEntity<Product> createProduct(Product product, org.springframework.web.multipart.MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            try {
                String imageKey = fileStorageService.saveFile(image, "products");
                product.setImageUrl(imageKey);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            } catch (java.io.IOException e) {
                return ResponseEntity.internalServerError().build();
            }
        }
        return ResponseEntity.ok(productService.save(product));
    }

    // ─── PUT: Update ──────────────────────────────────────────────────────────
    @Override
    public ResponseEntity<Product> updateProduct(Long id, Product product, org.springframework.web.multipart.MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            try {
                String imageKey = fileStorageService.saveFile(image, "products");
                product.setImageUrl(imageKey);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            } catch (java.io.IOException e) {
                return ResponseEntity.internalServerError().build();
            }
        }
        return ResponseEntity.ok(productService.update(id, product));
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────
    @Override
    public ResponseEntity<Void> deleteProduct(Long id) {
        productService.delete(id);
        return ResponseEntity.ok().build();
    }
}

