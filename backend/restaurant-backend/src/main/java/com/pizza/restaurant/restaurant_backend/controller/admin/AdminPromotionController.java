package com.pizza.restaurant.restaurant_backend.controller.admin;

import com.pizza.restaurant.restaurant_backend.api.admin.AdminPromotionApi;
import com.pizza.restaurant.restaurant_backend.model.Promotion;
import com.pizza.restaurant.restaurant_backend.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class AdminPromotionController implements AdminPromotionApi {

    @Autowired
    private PromotionService promotionService;

    @Override
    public ResponseEntity<List<Promotion>> getPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @Override
    public ResponseEntity<?> createPromotion(Promotion promotion) {
        try {
            Promotion newPromo = promotionService.createPromotion(promotion);
            return ResponseEntity.ok(newPromo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> updateStatus(Long id, Map<String, String> body) {
        try {
            String newStatus = body.get("status");
            if (newStatus == null || newStatus.isBlank()) {
                return ResponseEntity.badRequest().body("Thiếu trạng thái mới");
            }
            Promotion updated = promotionService.updateStatus(id, newStatus.toUpperCase());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deletePromotion(Long id) {
        try {
            promotionService.deletePromotion(id);
            return ResponseEntity.ok("Xóa voucher thành công");
        } catch (RuntimeException e) {
             return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
