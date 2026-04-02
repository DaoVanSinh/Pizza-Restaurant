package com.pizza.restaurant.restaurant_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "promotions")
@Data
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; // Ví dụ: PIZZA10 - giảm 10% cho đơn hàng pizza

    private Integer discountPercent;
    private LocalDate expiryDate; // Hạn sử dụng
    private String status; // "Hoạt động" hoặc "Tạm dừng"
}
