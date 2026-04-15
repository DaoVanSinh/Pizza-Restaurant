package com.pizza.restaurant.restaurant_backend.api.admin;

import com.pizza.restaurant.restaurant_backend.model.Promotion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/v1/admin/promotions")
@Tag(name = "Admin Promotions", description = "Admin Promotion Management")
public interface AdminPromotionApi {

    @Operation(summary = "Lấy tất cả danh sách promotion")
    @GetMapping
    ResponseEntity<List<Promotion>> getPromotions();

    @Operation(summary = "Tạo promotion mới")
    @PostMapping
    ResponseEntity<?> createPromotion(@RequestBody Promotion promotion);

    @Operation(summary = "Xóa promotion")
    @DeleteMapping("/{id}")
    ResponseEntity<?> deletePromotion(@PathVariable Long id);
}
