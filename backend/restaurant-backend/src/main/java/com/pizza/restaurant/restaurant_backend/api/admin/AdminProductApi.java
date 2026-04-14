package com.pizza.restaurant.restaurant_backend.api.admin;

import com.pizza.restaurant.restaurant_backend.model.Product;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/v1/admin/products")
@Tag(name = "Admin Products", description = "Quản lý sản phẩm (Admin)")
public interface AdminProductApi {

    @Operation(summary = "Lấy danh sách tất cả sản phẩm (có thể lọc theo category slug)")
    @GetMapping
    ResponseEntity<List<Product>> getAllProducts(@RequestParam(required = false) String category);

    @Operation(summary = "Lấy chi tiết 1 sản phẩm theo ID")
    @GetMapping("/{id}")
    ResponseEntity<Product> getProductById(@PathVariable Long id);

    @Operation(summary = "Thêm sản phẩm mới")
    @PostMapping(consumes = {"multipart/form-data"})
    ResponseEntity<Product> createProduct(
            @RequestPart("product") Product product,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image);

    @Operation(summary = "Cập nhật sản phẩm")
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") Product product,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image);

    @Operation(summary = "Xóa sản phẩm")
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteProduct(@PathVariable Long id);
}
