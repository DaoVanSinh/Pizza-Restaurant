package com.pizza.restaurant.restaurant_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

/**
 * Theo dõi lịch sử sử dụng voucher theo từng user + đơn hàng.
 * Dùng để: (1) Check limitPerUser, (2) Rollback khi thanh toán thất bại, (3) Thống kê.
 */
@Data
@Entity
@Table(name = "voucher_usages")
public class VoucherUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotion promotion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @CreationTimestamp
    @Column(name = "used_at", updatable = false)
    private Timestamp usedAt;
}
