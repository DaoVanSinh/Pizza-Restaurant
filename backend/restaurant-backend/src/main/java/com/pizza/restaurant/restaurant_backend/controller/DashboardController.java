package com.pizza.restaurant.restaurant_backend.controller;

import com.pizza.restaurant.restaurant_backend.repository.OrderItemRepository;
import com.pizza.restaurant.restaurant_backend.repository.OrderRepository;
import com.pizza.restaurant.restaurant_backend.repository.ProductRepository;
import com.pizza.restaurant.restaurant_backend.repository.TransactionRepository;
import com.pizza.restaurant.restaurant_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TransactionRepository transactionRepository;

    // ── Tổng quan ──────────────────────────────────────────────────────────────
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();

        Double revenue = orderRepository.calculateTotalRevenue();
        stats.put("revenue",      revenue != null ? revenue : 0.0);
        stats.put("orders",       orderRepository.countByStatus("complete"));
        stats.put("pendingOrders",orderRepository.countByStatus("pending"));
        stats.put("products",     productRepository.count());
        stats.put("customers",    userRepository.countByRole("user"));
        stats.put("transactions", transactionRepository.count());

        return stats;
    }

    // ── Doanh thu theo tháng ───────────────────────────────────────────────────
    @GetMapping("/revenue/monthly")
    public List<Map<String, Object>> revenueByMonth(
            @RequestParam(defaultValue = "0") int year) {

        int targetYear = year > 0 ? year : LocalDate.now().getYear();
        List<Object[]> rows = orderRepository.revenueByMonth(targetYear);

        // Khởi tạo 12 tháng với 0
        Map<Integer, Map<String, Object>> monthMap = new LinkedHashMap<>();
        String[] MONTHS = {"T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"};
        for (int i = 1; i <= 12; i++) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", MONTHS[i - 1]);
            m.put("revenue", 0);
            m.put("orders", 0);
            monthMap.put(i, m);
        }

        for (Object[] row : rows) {
            int month = ((Number) row[0]).intValue();
            monthMap.get(month).put("revenue", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            monthMap.get(month).put("orders",  row[2] != null ? ((Number) row[2]).longValue() : 0L);
        }

        return new ArrayList<>(monthMap.values());
    }

    // ── Doanh thu theo ngày trong tháng ────────────────────────────────────────
    @GetMapping("/revenue/daily")
    public List<Map<String, Object>> revenueByDay(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {

        LocalDate now = LocalDate.now();
        int targetYear  = year  > 0 ? year  : now.getYear();
        int targetMonth = month > 0 ? month : now.getMonthValue();
        int daysInMonth = LocalDate.of(targetYear, targetMonth, 1).lengthOfMonth();

        List<Object[]> rows = orderRepository.revenueByDay(targetYear, targetMonth);
        Map<Integer, Map<String, Object>> dayMap = new LinkedHashMap<>();
        for (int d = 1; d <= daysInMonth; d++) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("day", d);
            m.put("revenue", 0);
            m.put("orders", 0);
            dayMap.put(d, m);
        }

        for (Object[] row : rows) {
            int day = ((Number) row[0]).intValue();
            if (dayMap.containsKey(day)) {
                dayMap.get(day).put("revenue", row[1] != null ? ((Number) row[1]).longValue() : 0L);
                dayMap.get(day).put("orders",  row[2] != null ? ((Number) row[2]).longValue() : 0L);
            }
        }

        return new ArrayList<>(dayMap.values());
    }

    // ── Top sản phẩm bán chạy ─────────────────────────────────────────────────
    @GetMapping("/top-products")
    public List<Map<String, Object>> topProducts(
            @RequestParam(defaultValue = "10") int limit) {

        List<Object[]> rows = orderItemRepository.findTopProducts(limit);
        List<Map<String, Object>> result = new ArrayList<>();
        int rank = 1;
        for (Object[] row : rows) {
            // row: [0]=p.id, [1]=p.name, [2]=p.image_url, [3]=totalQty, [4]=totalRevenue
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("rank",         rank++);
            m.put("productId",    row[0]);
            m.put("name",         row[1]);
            m.put("imageUrl",     row[2]);
            m.put("totalQty",     row[3] != null ? ((Number) row[3]).longValue() : 0L);
            m.put("totalRevenue", row[4] != null ? ((Number) row[4]).longValue() : 0L);
            result.add(m);
        }
        return result;
    }

    // ── Phân tích thanh toán ────────────────────────────────────────────────────
    @GetMapping("/payment-analysis")
    public List<Map<String, Object>> paymentAnalysis() {
        List<Object[]> rows = orderRepository.revenueByPaymentMethod();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("method",  row[0]);
            m.put("count",   row[1] != null ? ((Number) row[1]).longValue() : 0L);
            m.put("revenue", row[2] != null ? ((Number) row[2]).longValue() : 0L);
            result.add(m);
        }
        return result;
    }

    // ── Phân bổ trạng thái đơn hàng ────────────────────────────────────────────
    @GetMapping("/order-status-dist")
    public List<Map<String, Object>> orderStatusDist() {
        List<Object[]> rows = orderRepository.countAllByStatus();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("status", row[0]);
            m.put("count",  row[1] != null ? ((Number) row[1]).longValue() : 0L);
            result.add(m);
        }
        return result;
    }
}
