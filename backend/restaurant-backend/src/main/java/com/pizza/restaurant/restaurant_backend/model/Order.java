package com.pizza.restaurant.restaurant_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // ID khách hàng mua
    private Double totalPrice;
    private String status; // 'Chờ xác nhận', 'Đang chế biến', 'Đã giao'
    private LocalDateTime orderDate = LocalDateTime.now();
    private String paymentMethod; // 'COD', 'Online'

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items; // Chi tiết từng món trong đơn
}
