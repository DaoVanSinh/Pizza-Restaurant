package com.pizza.restaurant.restaurant_backend.repository;

import com.pizza.restaurant.restaurant_backend.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    /** Top sản phẩm bán chạy nhất theo số lượng (tính tất cả đơn chưa huỷ) */
    @Query(value = """
        SELECT p.id, p.name, p.image_url, SUM(oi.amount) as totalQty, SUM(oi.price * oi.amount) as totalRevenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status != 'cancel'
        GROUP BY p.id, p.name, p.image_url
        ORDER BY totalQty DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> findTopProducts(@Param("limit") int limit);
}
