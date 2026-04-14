package com.pizza.restaurant.restaurant_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemRequest {
    @NotNull(message = "Product ID không được để trống")
    private Long productId;

    @Min(value = 1, message = "Số lượng ít nhất là 1")
    private Integer amount;
}
