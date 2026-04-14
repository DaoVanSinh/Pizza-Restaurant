package com.pizza.restaurant.restaurant_backend.api.admin;

import com.pizza.restaurant.restaurant_backend.dto.AdminOrderDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/api/v1/admin/orders")
@Tag(name = "Admin Orders", description = "Quản lý Đơn hàng (Admin)")
public interface AdminOrderApi {

    @Operation(summary = "Lấy tất cả đơn hàng kèm thông tin thanh toán")
    @GetMapping
    ResponseEntity<List<AdminOrderDTO>> getAllOrders(@RequestParam(required = false) String status);

    @Operation(summary = "Cập nhật trạng thái đơn hàng")
    @PutMapping("/{id}/status")
    ResponseEntity<AdminOrderDTO> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body);

    @Operation(summary = "Thống kê số lượng đơn theo trạng thái")
    @GetMapping("/count")
    ResponseEntity<Map<String, Long>> countByStatus();

    @Operation(summary = "Admin xác nhận đã thu tiền mặt (COD)")
    @PutMapping("/{id}/confirm-payment")
    ResponseEntity<Void> confirmCodPayment(@PathVariable Long id);
}
