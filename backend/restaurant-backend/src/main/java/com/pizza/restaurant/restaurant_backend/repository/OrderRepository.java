package com.pizza.restaurant.restaurant_backend.repository;

import com.pizza.restaurant.restaurant_backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /** Tổng doanh thu các đơn đã hoàn thành */
    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.status = 'complete'")
    Double calculateTotalRevenue();

    /** Doanh thu theo từng tháng trong năm */
    @Query(value = """
        SELECT MONTH(created_at) as month, SUM(total_price) as revenue, COUNT(*) as orderCount
        FROM orders
        WHERE status = 'complete' AND YEAR(created_at) = :year
        GROUP BY MONTH(created_at)
        ORDER BY month
    """, nativeQuery = true)
    List<Object[]> revenueByMonth(@Param("year") int year);

    /** Doanh thu theo từng ngày trong tháng */
    @Query(value = """
        SELECT DAY(created_at) as day, SUM(total_price) as revenue, COUNT(*) as orderCount
        FROM orders
        WHERE status = 'complete'
          AND YEAR(created_at) = :year
          AND MONTH(created_at) = :month
        GROUP BY DAY(created_at)
        ORDER BY day
    """, nativeQuery = true)
    List<Object[]> revenueByDay(@Param("year") int year, @Param("month") int month);

    /** Thống kê theo phương thức thanh toán */
    @Query(value = """
        SELECT p.payment_method, COUNT(*) as cnt, SUM(o.total_price) as revenue
        FROM orders o
        JOIN payments p ON o.payment_id = p.id
        WHERE o.status = 'complete'
        GROUP BY p.payment_method
    """, nativeQuery = true)
    List<Object[]> revenueByPaymentMethod();

    /** Thống kê trạng thái đơn hàng */
    @Query(value = """
        SELECT status, COUNT(*) as cnt
        FROM orders
        GROUP BY status
    """, nativeQuery = true)
    List<Object[]> countAllByStatus();

    /** Đếm theo trạng thái */
    long countByStatus(String status);

    /** Lấy theo trạng thái */
    List<Order> findByStatus(String status);

    /** Tất cả đơn, mới nhất lên đầu */
    List<Order> findAllByOrderByCreatedAtDesc();

    /** Lọc trạng thái + mới nhất lên đầu */
    List<Order> findByStatusOrderByCreatedAtDesc(String status);

    /** Lấy đơn hàng theo User ID */
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
}
