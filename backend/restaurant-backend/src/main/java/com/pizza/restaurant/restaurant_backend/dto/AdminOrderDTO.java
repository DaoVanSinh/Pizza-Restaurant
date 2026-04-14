package com.pizza.restaurant.restaurant_backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

/**
 * DTO dùng cho Admin — bao gồm thông tin thanh toán đầy đủ.
 * Tránh lazy-loading issues khi serialize Order entity.
 */
@Data
public class AdminOrderDTO {
    private Long id;
    private String status;       // pending | preparing | ready | complete | cancel
    private String orderType;    // DELIVERY | PICKUP
    private String address;
    private String recipientName;
    private String recipientPhone;
    private String note;
    private String cancelReason; // Lý do hủy đơn (chỉ có khi status = cancel)
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal totalPrice;
    private Timestamp createdAt;

    // Payment info
    private String paymentMethod; // cod | vnpay
    private String paymentStatus; // pending | success | cancel

    // Items (optional, for detail modal)
    private List<OrderItemDTO> items;
}
