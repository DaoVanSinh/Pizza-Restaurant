package com.pizza.restaurant.restaurant_backend.repository;

import com.pizza.restaurant.restaurant_backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Tính tổng doanh thu (Phục vụ báo cáo Dashboard)
    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.status = 'Đã giao'")
    Double calculateTotalRevenue();

    // Đếm số lượng đơn hàng thành công
    long countByStatus(String status);
}
