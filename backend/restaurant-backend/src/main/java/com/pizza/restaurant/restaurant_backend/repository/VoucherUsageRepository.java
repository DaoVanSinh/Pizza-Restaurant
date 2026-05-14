package com.pizza.restaurant.restaurant_backend.repository;

import com.pizza.restaurant.restaurant_backend.model.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {

    /**
     * Đếm số lần user đã dùng một voucher cụ thể (để check limitPerUser)
     */
    int countByPromotionIdAndUserId(Long promotionId, Long userId);

    /**
     * Tìm usage record theo promotion + order (để rollback)
     */
    Optional<VoucherUsage> findByPromotionIdAndOrderId(Long promotionId, Long orderId);

    /**
     * Xóa tất cả usage records của 1 order (khi hủy đơn)
     */
    void deleteByOrderId(Long orderId);
}
