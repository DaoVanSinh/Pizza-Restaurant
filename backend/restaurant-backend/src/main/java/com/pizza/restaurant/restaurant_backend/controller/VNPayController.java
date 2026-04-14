package com.pizza.restaurant.restaurant_backend.controller;

import com.pizza.restaurant.restaurant_backend.config.VNPayConfig;
import com.pizza.restaurant.restaurant_backend.utils.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * API VNPay:
 *  POST /api/v1/payment/vnpay/create  → tạo URL thanh toán
 *  GET  /api/v1/payment/vnpay/return  → xử lý callback sau khi thanh toán
 */
@RestController
@RequestMapping("/api/v1/payment/vnpay")

public class VNPayController {

    @Autowired
    private VNPayConfig vnPayConfig;

    /**
     * Tạo URL chuyển hướng đến VNPay Sandbox/Production.
     *
     * Request body:
     * {
     *   "orderId": 42,
     *   "amount": 150000,       ← VNĐ (nguyên, không có phần thập phân)
     *   "orderInfo": "Thanh toan don hang #42"
     * }
     *
     * Response:
     * { "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/..." }
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createPayment(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        if (body.get("orderId") == null || body.get("amount") == null) {
            return ResponseEntity.badRequest().build();
        }

        Long orderId = Long.valueOf(body.get("orderId").toString());
        long amount = Long.parseLong(body.get("amount").toString()); // VNĐ
        String orderInfo = body.getOrDefault("orderInfo",
                "Thanh toan don hang #" + orderId).toString();

        String txnRef = VNPayUtil.generateTxnRef(orderId);
        String now = VNPayUtil.getNow();

        // Lấy IP khách hàng
        String ipAddr = getClientIp(request);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version",    vnPayConfig.getVersion());
        vnp_Params.put("vnp_Command",    vnPayConfig.getCommand());
        vnp_Params.put("vnp_TmnCode",    vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount",     String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode",   vnPayConfig.getCurrencyCode());
        vnp_Params.put("vnp_TxnRef",     txnRef);
        vnp_Params.put("vnp_OrderInfo",  orderInfo);
        vnp_Params.put("vnp_OrderType",  "other");
        vnp_Params.put("vnp_Locale",     vnPayConfig.getLocale());
        vnp_Params.put("vnp_ReturnUrl",  vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr",     ipAddr);
        vnp_Params.put("vnp_CreateDate", now);

        // Copy CHÍNH XÁC logic từ ajaxServlet.java của VNPay
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data: key RAW, value ENCODED bằng US_ASCII
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query: cả key và value ENCODED bằng US_ASCII
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayUtil.hmacSHA512(hashData.toString(), vnPayConfig.getHashSecret());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.getVnpayUrl() + "?" + queryUrl;

        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    @Autowired
    private com.pizza.restaurant.restaurant_backend.service.OrderService orderService;

    /**
     * VNPay gọi lại URL sau khi user thanh toán xong.
     * Frontend sẽ hiển thị kết quả dựa vào vnp_ResponseCode:
     *   "00" = thành công, còn lại = thất bại.
     *
     * Controller chỉ verify chữ ký và trả JSON — KHÔNG redirect.
     * Frontend tự điều hướng.
     */
    @GetMapping("/return")
    public ResponseEntity<Map<String, Object>> handleReturn(
            @RequestParam Map<String, String> queryParams) {

        String receivedHash = queryParams.remove("vnp_SecureHash");
        queryParams.remove("vnp_SecureHashType");

        // Verify theo logic gốc của VNPay (y chang ajaxServlet.java)
        List<String> fieldNames = new ArrayList<>(queryParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = queryParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                if (hashData.length() > 0) hashData.append('&');
                // Key RAW, value encode bằng US_ASCII
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
            }
        }
        String expectedHash = VNPayUtil.hmacSHA512(hashData.toString(), vnPayConfig.getHashSecret());

        boolean valid = expectedHash.equalsIgnoreCase(receivedHash);
        String responseCode = queryParams.get("vnp_ResponseCode");
        boolean isSuccess = valid && "00".equals(responseCode);
        
        String txnRef = queryParams.get("vnp_TxnRef");
        String vnpTransactionNo = queryParams.get("vnp_TransactionNo");

        if (valid && txnRef != null && txnRef.contains("_")) {
            try {
                // txnRef format: orderId_timestamp
                Long orderId = Long.valueOf(txnRef.split("_")[0]);
                orderService.updatePaymentStatus(orderId, isSuccess);

                // Ghi nhận giao dịch VNPay vào bảng transactions (chỉ khi thành công)
                if (isSuccess && vnpTransactionNo != null) {
                    orderService.recordTransaction(orderId, vnpTransactionNo);
                }
            } catch (Exception e) {
                // Log lỗi nếu cần thiết (e.g. order không tồn tại)
                e.printStackTrace();
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("valid",        valid);
        result.put("success",      isSuccess);
        result.put("responseCode", responseCode);
        result.put("txnRef",       txnRef);
        result.put("amount",       queryParams.get("vnp_Amount"));
        result.put("orderInfo",    queryParams.get("vnp_OrderInfo"));
        result.put("transactionNo",queryParams.get("vnp_TransactionNo"));
        result.put("bankCode",     queryParams.get("vnp_BankCode"));
        result.put("payDate",      queryParams.get("vnp_PayDate"));

        return ResponseEntity.ok(result);
    }

    // ─── Helper ────────────────────────────────────────────────────
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) ip = request.getRemoteAddr();
        // Nếu nhiều IP (proxy chain), lấy IP đầu tiên
        if (ip != null && ip.contains(",")) ip = ip.split(",")[0].trim();
        return ip != null ? ip : "127.0.0.1";
    }
}

