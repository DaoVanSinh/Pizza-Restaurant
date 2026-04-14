package com.pizza.restaurant.restaurant_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private Integer amount;
    private String selectedSize;
    private String note;
    private BigDecimal price;
}
