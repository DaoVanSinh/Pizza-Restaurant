package com.pizza.restaurant.restaurant_backend.api.client;

import com.pizza.restaurant.restaurant_backend.dto.OrderDTO;
import com.pizza.restaurant.restaurant_backend.model.Order;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/v1/client/orders")
@Tag(name = "Client Orders", description = "Đơn hàng của Khách")
public interface ClientOrderApi {

    @Operation(summary = "Tạo đơn hàng mới")
    @PostMapping("/create")
    ResponseEntity<Order> createOrder(HttpServletRequest request, @RequestBody com.pizza.restaurant.restaurant_backend.dto.OrderRequest orderRequest);

    @Operation(summary = "Lấy danh sách đơn hàng cá nhân (kèm items)")
    @GetMapping
    ResponseEntity<List<OrderDTO>> getMyOrders(HttpServletRequest request);

    @Operation(summary = "Xem chi tiết một đơn đặt hàng (kèm items)")
    @GetMapping("/{id}")
    ResponseEntity<OrderDTO> getOrderById(HttpServletRequest request, @PathVariable Long id);
}
