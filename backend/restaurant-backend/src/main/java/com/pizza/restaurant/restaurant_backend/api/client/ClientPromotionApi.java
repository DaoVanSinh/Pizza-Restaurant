package com.pizza.restaurant.restaurant_backend.api.client;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/v1/client/promotions")
@Tag(name = "Client Promotions", description = "Client Promotion Check")
public interface ClientPromotionApi {

    @Operation(summary = "Kiểm tra tính hợp lệ của mã giảm giá")
    @GetMapping("/check")
    ResponseEntity<?> checkPromotion(@RequestParam String code);
}
