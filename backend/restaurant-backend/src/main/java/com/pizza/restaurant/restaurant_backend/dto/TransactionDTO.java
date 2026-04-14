package com.pizza.restaurant.restaurant_backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
public class TransactionDTO {
    private Long id;
    private String transactionCode;
    private Timestamp createdAt;

    // Thông tin đơn hàng liên quan
    private Long orderId;
    private BigDecimal orderTotal;
    private String orderStatus;
    private String recipientName;

    // Thông tin thanh toán
    private String paymentMethod;
}
