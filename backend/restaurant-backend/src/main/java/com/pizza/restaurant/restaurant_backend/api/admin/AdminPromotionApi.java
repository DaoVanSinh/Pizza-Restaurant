package com.pizza.restaurant.restaurant_backend.api.admin;

import com.pizza.restaurant.restaurant_backend.model.Promotion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/api/v1/admin/promotions")
@Tag(name = "Admin Promotions", description = "Admin Promotion/Voucher Management")
public interface AdminPromotionApi {

    @Operation(summary = "Lấy tất cả danh sách voucher")
    @GetMapping
    ResponseEntity<List<Promotion>> getPromotions();

    @Operation(summary = "Tạo voucher mới")
    @PostMapping
    ResponseEntity<?> createPromotion(@RequestBody Promotion promotion);

    @Operation(summary = "Cập nhật trạng thái voucher (DRAFT→ACTIVE, ACTIVE→PAUSED, PAUSED→ACTIVE)")
    @PutMapping("/{id}/status")
    ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body);

    @Operation(summary = "Xóa voucher")
    @DeleteMapping("/{id}")
    ResponseEntity<?> deletePromotion(@PathVariable Long id);
}
