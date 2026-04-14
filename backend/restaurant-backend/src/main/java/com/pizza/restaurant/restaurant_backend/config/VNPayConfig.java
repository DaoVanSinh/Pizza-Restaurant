package com.pizza.restaurant.restaurant_backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Đọc cấu hình VNPay từ application.properties (nguồn: .env)
 *
 * .env cần thêm:
 *   VNPAY_TMN_CODE=<mã merchant của bạn>
 *   VNPAY_HASH_SECRET=<secret key>
 *   VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
 *   VNPAY_RETURN_URL=http://localhost:5173/payment/vnpay-return
 */
@Getter
@Component
public class VNPayConfig {

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.url}")
    private String vnpayUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    @Value("${vnpay.version:2.1.0}")
    private String version;

    @Value("${vnpay.command:pay}")
    private String command;

    @Value("${vnpay.currency-code:VND}")
    private String currencyCode;

    @Value("${vnpay.locale:vn}")
    private String locale;
}
