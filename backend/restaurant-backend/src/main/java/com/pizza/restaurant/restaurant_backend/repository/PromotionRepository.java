package com.pizza.restaurant.restaurant_backend.repository;

import com.pizza.restaurant.restaurant_backend.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    // Tìm khuyến mãi theo mã hoặc trạng thái [cite: 331]
    List<Promotion> findByCodeContainingIgnoreCaseOrStatus(String code, String status);
}
