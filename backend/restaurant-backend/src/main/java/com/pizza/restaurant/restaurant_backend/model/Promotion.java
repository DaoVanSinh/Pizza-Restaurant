package com.pizza.restaurant.restaurant_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "promotions")
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    // Loại giảm giá: "PERCENT" (giảm theo %) hoặc "FIXED" (giảm số tiền cố định)
    @Column(name = "discount_type", nullable = false, length = 20)
    private String discountType;

    // Giá trị giảm: nếu PERCENT thì VD 20 = 20%, nếu FIXED thì VD 50000 = 50.000đ
    @Column(name = "discount_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountValue;

    // Giảm tối đa (VNĐ) - chỉ áp dụng cho PERCENT, null = không giới hạn
    @Column(name = "max_discount_amount", precision = 15, scale = 2)
    private BigDecimal maxDiscountAmount;

    // Giá trị đơn hàng tối thiểu để được áp dụng voucher (BẮT BUỘC)
    @Column(name = "min_order_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal minOrderValue;

    // Ngày bắt đầu hiệu lực
    @Column(name = "start_date", nullable = false)
    private Timestamp startDate;

    // Ngày hết hạn
    @Column(name = "end_date", nullable = false)
    private Timestamp endDate;

    // Tổng số lượt được phép sử dụng, null = không giới hạn
    @Column(name = "total_usage_limit")
    private Integer totalUsageLimit;

    // Số lượt đã sử dụng thực tế
    @Column(name = "usage_count", nullable = false)
    private Integer usageCount = 0;

    // Giới hạn số lần sử dụng trên mỗi khách hàng
    @Column(name = "limit_per_user", nullable = false)
    private Integer limitPerUser = 1;

    // Trạng thái: DRAFT (Nháp), ACTIVE (Đang chạy), PAUSED (Tạm dừng), EXPIRED (Đã hết hạn)
    @Column(nullable = false, length = 20)
    private String status = "DRAFT";

    // Optimistic Locking - chống race condition khi nhiều user dùng voucher đồng thời
    @Version
    private Integer version;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;
}
