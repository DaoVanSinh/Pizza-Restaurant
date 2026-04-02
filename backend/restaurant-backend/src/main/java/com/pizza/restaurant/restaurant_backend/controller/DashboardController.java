package com.pizza.restaurant.restaurant_backend.controller;

import com.pizza.restaurant.restaurant_backend.repository.OrderRepository;
import com.pizza.restaurant.restaurant_backend.repository.ProductRepository;
import com.pizza.restaurant.restaurant_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        // Lấy dữ liệu thực tế từ MySQL để hiển thị lên card Dashboard
        stats.put("revenue", orderRepository.calculateTotalRevenue()); // Doanh thu
        stats.put("orders", orderRepository.countByStatus("Đã giao")); // Tổng đơn
        stats.put("products", productRepository.count()); // Tổng số món ăn
        stats.put("customers", userRepository.countByRole("USER")); // Tổng khách hàng
        return stats;
    }
}
