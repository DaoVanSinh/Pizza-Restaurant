package com.pizza.restaurant.restaurant_backend.service;

import com.pizza.restaurant.restaurant_backend.dto.OrderRequest;
import com.pizza.restaurant.restaurant_backend.dto.VoucherResult;
import com.pizza.restaurant.restaurant_backend.model.*;
import com.pizza.restaurant.restaurant_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PromotionService promotionService;

    @Transactional
    public Order createOrder(User user, OrderRequest request) {
        // 1. Tạo Payment mới
        Payment payment = new Payment();
        payment.setStatus("pending");
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().toLowerCase() : "cod");
        payment = paymentRepository.save(payment);

        // 2. Tạo Order
        Order order = new Order();
        order.setUser(user);
        order.setOrderType(request.getOrderType() != null ? request.getOrderType().toUpperCase() : "DELIVERY"); 
        
        // If delivery, require address. If pickup, address can be null/empty
        if ("DELIVERY".equals(order.getOrderType())) {
            order.setAddress(request.getAddress() != null ? request.getAddress() : "Chưa có địa chỉ");
        } else {
            order.setAddress(null);
        }

        order.setRecipientName(request.getRecipientName());
        order.setRecipientPhone(request.getRecipientPhone());
        order.setNote(request.getNote());
        order.setShippingFee(request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO);

        // === VALIDATE & TÍNH GIÁ SERVER-SIDE (không tin client) ===
        // Tính tổng tiền hàng từ items
        BigDecimal itemsTotal = BigDecimal.ZERO;
        for (OrderRequest.OrderItemDto item : request.getItems()) {
            BigDecimal price = item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO;
            itemsTotal = itemsTotal.add(price.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // Validate & apply voucher
        BigDecimal discountAmount = BigDecimal.ZERO;
        Promotion appliedPromo = null;
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            VoucherResult result = promotionService.validateAndCalculate(
                    request.getVoucherCode(), user.getId(), itemsTotal);
            discountAmount = result.getDiscount();
            appliedPromo = result.getPromotion();
            order.setVoucherCode(appliedPromo.getCode());
        }
        order.setDiscountAmount(discountAmount);

        // Tính totalPrice server-side
        BigDecimal shippingFee = order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO;
        order.setTotalPrice(itemsTotal.add(shippingFee).subtract(discountAmount));

        order.setStatus("pending");
        order.setPayment(payment);
        Order savedOrder = orderRepository.save(order);

        // 3. Tạo các OrderItems từ OrderRequest
        for (OrderRequest.OrderItemDto itemDto : request.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + itemDto.getProductId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setAmount(itemDto.getQuantity());
            
            if (itemDto.getSize() != null && !itemDto.getSize().isEmpty()) {
                String size = itemDto.getSize().trim().toUpperCase();
                // Ánh xạ các tên size phổ biến sang ENUM S, M, L trong DB
                if (size.contains("NHỎ") || size.contains("SMALL") || size.equals("6 INCH") || size.equals("S")) size = "S";
                else if (size.contains("VỪA") || size.contains("MEDIUM") || size.equals("9 INCH") || size.equals("M")) size = "M";
                else if (size.contains("LỚN") || size.contains("LARGE") || size.equals("12 INCH") || size.equals("L")) size = "L";
                else size = "M"; // Mặc định là M nếu không khớp

                orderItem.setSelectedSize(size);
            }
            orderItem.setNote(itemDto.getNote());
            orderItem.setPrice(itemDto.getPrice() != null ? itemDto.getPrice() : product.getPrice());
            
            orderItemRepository.save(orderItem);
        }

        // 4. Ghi nhận lượt dùng voucher (sau khi order đã save thành công)
        if (appliedPromo != null) {
            promotionService.applyVoucher(appliedPromo.getId(), user, savedOrder);
        }

        return savedOrder;
    }

    @Transactional
    public void updatePaymentStatus(Long orderId, boolean isSuccess) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));
        
        Payment payment = order.getPayment();
        if (payment == null) {
            throw new RuntimeException("Đơn hàng chưa có thông tin thanh toán");
        }

        // Bỏ qua nếu đã được xử lý
        if (!"pending".equals(payment.getStatus())) {
            return;
        }

        if (isSuccess) {
            // Chỉ cập nhật trạng thái THANH TOÁN thành công.
            // Order status GIỮ NGUYÊN "pending" để Admin xử lý theo workflow:
            //   pending → preparing → ready → complete
            payment.setStatus("success");
        } else {
            // Thanh toán thất bại → huỷ cả payment lẫn order
            payment.setStatus("cancel");
            order.setStatus("cancel");

            // Hoàn trả lượt dùng voucher
            if (order.getVoucherCode() != null && !order.getVoucherCode().isEmpty()) {
                promotionService.rollbackVoucher(orderId);
            }
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    /**
     * Ghi nhận một giao dịch thanh toán thực sự từ VNPay.
     * Có idempotency guard: nếu transaction_code đã tồn tại thì bỏ qua.
     *
     * @param orderId         ID của đơn hàng
     * @param transactionCode Mã giao dịch từ VNPay (vnp_TransactionNo)
     */
    @Transactional
    public void recordTransaction(Long orderId, String transactionCode) {
        if (transactionCode == null || transactionCode.isBlank()) return;

        // Idempotency: Không tạo bản ghi trùng lặp
        if (transactionRepository.existsByTransactionCode(transactionCode)) {
            return;
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));

        Transaction transaction = new Transaction();
        transaction.setOrder(order);
        transaction.setTransactionCode(transactionCode);
        transactionRepository.save(transaction);
    }

    /**
     * Admin xác nhận đã thu tiền mặt (COD).
     * Chỉ áp dụng cho đơn có payment_method = cod và payment.status = pending.
     */
    @Transactional
    public void confirmCodPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));

        Payment payment = order.getPayment();
        if (payment == null) {
            throw new RuntimeException("Đơn hàng chưa có thông tin thanh toán");
        }
        if (!"cod".equalsIgnoreCase(payment.getPaymentMethod())) {
            throw new RuntimeException("Chỉ áp dụng cho đơn thanh toán tiền mặt (COD)");
        }
        if (!"pending".equals(payment.getStatus())) {
            throw new RuntimeException("Đơn hàng này đã được xử lý thanh toán rồi");
        }

        payment.setStatus("success");
        paymentRepository.save(payment);

        // Ghi nhận giao dịch COD vào bảng transactions (idempotency guard)
        String codTxnCode = "COD-" + orderId;
        if (!transactionRepository.existsByTransactionCode(codTxnCode)) {
            Transaction transaction = new Transaction();
            transaction.setOrder(order);
            transaction.setTransactionCode(codTxnCode);
            transactionRepository.save(transaction);
        }
    }
}
