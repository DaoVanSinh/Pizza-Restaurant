package com.pizza.restaurant.restaurant_backend.controller.client;

import com.pizza.restaurant.restaurant_backend.api.client.ClientOrderApi;
import com.pizza.restaurant.restaurant_backend.dto.OrderDTO;
import com.pizza.restaurant.restaurant_backend.dto.OrderItemDTO;
import com.pizza.restaurant.restaurant_backend.model.Order;
import com.pizza.restaurant.restaurant_backend.model.OrderItem;
import com.pizza.restaurant.restaurant_backend.repository.OrderItemRepository;
import com.pizza.restaurant.restaurant_backend.repository.OrderRepository;
import com.pizza.restaurant.restaurant_backend.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class ClientOrderController implements ClientOrderApi {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private com.pizza.restaurant.restaurant_backend.repository.UserRepository userRepository;

    private OrderDTO toOrderDTO(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());

        List<OrderItemDTO> itemDTOs = items.stream().map(item -> {
            OrderItemDTO dto = new OrderItemDTO();
            dto.setId(item.getId());
            dto.setProductId(item.getProduct().getId());
            dto.setProductName(item.getProduct().getName());
            dto.setProductImage(item.getProduct().getImageUrl());
            dto.setAmount(item.getAmount());
            dto.setSelectedSize(item.getSelectedSize());
            dto.setNote(item.getNote());
            dto.setPrice(item.getPrice());
            return dto;
        }).collect(Collectors.toList());

        OrderDTO dto = new OrderDTO();
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
        if (order.getPayment() != null) {
            dto.setPaymentMethod(order.getPayment().getPaymentMethod());
            dto.setPaymentStatus(order.getPayment().getStatus());
        }
        dto.setItems(itemDTOs);
        return dto;
    }

    @Override
    public ResponseEntity<Order> createOrder(HttpServletRequest request, com.pizza.restaurant.restaurant_backend.dto.OrderRequest orderRequest) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
             return ResponseEntity.status(401).build();
        }
        
        com.pizza.restaurant.restaurant_backend.model.User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User không tồn tại"));

        return ResponseEntity.ok(orderService.createOrder(user, orderRequest));
    }

    @Override
    public ResponseEntity<List<OrderDTO>> getMyOrders(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<Order> userOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<OrderDTO> dtos = userOrders.stream().map(this::toOrderDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @Override
    public ResponseEntity<OrderDTO> getOrderById(HttpServletRequest request, Long id) {
        Optional<Order> order = orderRepository.findById(id);
        return order.map(o -> ResponseEntity.ok(toOrderDTO(o)))
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
