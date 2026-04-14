package com.pizza.restaurant.restaurant_backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private String status;
    private String orderType;
    private String address;
    private String recipientName;
    private String recipientPhone;
    private String note;
    private String cancelReason; 
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal totalPrice;
    private String paymentMethod;
    private String paymentStatus;
    private Timestamp createdAt;
    private List<OrderItemDTO> items;
}
