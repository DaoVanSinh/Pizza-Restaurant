package com.pizza.restaurant.restaurant_backend.controller.client;

import com.pizza.restaurant.restaurant_backend.api.client.ClientPromotionApi;
import com.pizza.restaurant.restaurant_backend.model.Promotion;
import com.pizza.restaurant.restaurant_backend.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ClientPromotionController implements ClientPromotionApi {

    @Autowired
    private PromotionService promotionService;

    @Override
    public ResponseEntity<?> checkPromotion(String code) {
        try {
            Promotion promotion = promotionService.validateCode(code);
            return ResponseEntity.ok(promotion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
