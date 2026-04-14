package com.pizza.restaurant.restaurant_backend.controller.admin;

import com.pizza.restaurant.restaurant_backend.api.admin.AdminOrderApi;
import com.pizza.restaurant.restaurant_backend.dto.AdminOrderDTO;
import com.pizza.restaurant.restaurant_backend.dto.OrderItemDTO;
import com.pizza.restaurant.restaurant_backend.model.Order;
import com.pizza.restaurant.restaurant_backend.model.OrderItem;
import com.pizza.restaurant.restaurant_backend.repository.OrderItemRepository;
import com.pizza.restaurant.restaurant_backend.repository.OrderRepository;
import com.pizza.restaurant.restaurant_backend.service.OrderService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class AdminOrderController implements AdminOrderApi {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderService orderService;

    // ── Mapper ────────────────────────────────────────────────────────────────
    private AdminOrderDTO toDTO(Order order) {
        AdminOrderDTO dto = new AdminOrderDTO();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus());
        dto.setOrderType(order.getOrderType());
        dto.setAddress(order.getAddress());
        dto.setRecipientName(order.getRecipientName());
        dto.setRecipientPhone(order.getRecipientPhone());
        dto.setNote(order.getNote());
        dto.setCancelReason(order.getCancelReason());
        dto.setShippingFee(order.getShippingFee());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setCreatedAt(order.getCreatedAt());

        // Eager-load payment info via separate field (avoids LazyInitializationException)
        if (order.getPayment() != null) {
            dto.setPaymentMethod(order.getPayment().getPaymentMethod());
            dto.setPaymentStatus(order.getPayment().getStatus());
        } else {
            dto.setPaymentMethod("cod");
            dto.setPaymentStatus("pending");
        }

        // Map items
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        List<OrderItemDTO> itemDTOs = items.stream().map(item -> {
            OrderItemDTO iDTO = new OrderItemDTO();
            iDTO.setId(item.getId());
            iDTO.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
            iDTO.setProductName(item.getProduct() != null ? item.getProduct().getName() : "Sản phẩm #" + item.getId());
            iDTO.setProductImage(item.getProduct() != null ? item.getProduct().getImageUrl() : null);
            iDTO.setAmount(item.getAmount());
            iDTO.setSelectedSize(item.getSelectedSize());
            iDTO.setNote(item.getNote());
            iDTO.setPrice(item.getPrice());
            return iDTO;
        }).collect(Collectors.toList());
        dto.setItems(itemDTOs);

        return dto;
    }

    // ── Endpoints ─────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public ResponseEntity<List<AdminOrderDTO>> getAllOrders(String status) {
        List<Order> orders;
        if (status != null && !status.isEmpty()) {
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(orders.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @Override
    @Transactional
    public ResponseEntity<AdminOrderDTO> updateOrderStatus(Long id, Map<String, String> body) {
        Optional<Order> optOrder = orderRepository.findById(id);
        if (optOrder.isEmpty()) return ResponseEntity.notFound().build();
        Order order = optOrder.get();
        String newStatus = body.get("status");
        order.setStatus(newStatus);
        // Nếu hủy đơn thì lưu lý do hủy
        if ("cancel".equals(newStatus) && body.containsKey("cancelReason")) {
            order.setCancelReason(body.get("cancelReason"));
        }
        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(toDTO(saved));
    }

    @Override
    public ResponseEntity<Map<String, Long>> countByStatus() {
        return ResponseEntity.ok(Map.of(
            "pending",   orderRepository.countByStatus("pending"),
            "preparing", orderRepository.countByStatus("preparing"),
            "ready",     orderRepository.countByStatus("ready"),
            "complete",  orderRepository.countByStatus("complete"),
            "cancel",    orderRepository.countByStatus("cancel")
        ));
    }

    @Override
    public ResponseEntity<Void> confirmCodPayment(Long id) {
        try {
            orderService.confirmCodPayment(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
