package com.pizza.restaurant.restaurant_backend.controller.admin;

import com.pizza.restaurant.restaurant_backend.api.admin.AdminPromotionApi;
import com.pizza.restaurant.restaurant_backend.model.Promotion;
import com.pizza.restaurant.restaurant_backend.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
    public ResponseEntity<?> deletePromotion(Long id) {
        try {
            promotionService.deletePromotion(id);
            return ResponseEntity.ok("Xóa khuyến mãi thành công");
        } catch (RuntimeException e) {
             return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
