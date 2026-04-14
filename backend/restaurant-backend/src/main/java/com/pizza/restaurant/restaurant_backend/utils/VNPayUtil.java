package com.pizza.restaurant.restaurant_backend.utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Tiện ích VNPay: ký HMAC-SHA512, build query string
 */
public class VNPayUtil {

    /**
     * Tạo chữ ký HMAC-SHA512 theo quy định VNPay.
     *
     * @param data   chuỗi đã được sort + urlencode
     * @param secret hash secret lấy từ VNPayConfig
     * @return hex string chữ ký
     */
    public static String hmacSHA512(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec keySpec = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(keySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : rawHmac) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo chữ ký VNPay", e);
        }
    }

    /**
     * Build query string đã sort key a-z + URL encode value.
     * Đây là định dạng bắt buộc của VNPay.
     */
    /**
     * Build chuỗi dữ liệu để ký (SecureHash).
     * Rule: Key giữ nguyên, Value được URL Encode.
     */
    public static String buildHashData(Map<String, String> params) {
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);
        StringBuilder sb = new StringBuilder();
        for (String key : keys) {
            if (params.get(key) != null && !params.get(key).isEmpty()) {
                if (sb.length() > 0) sb.append("&");
                // Key KHÔNG encode, Value CÓ encode
                sb.append(key)
                  .append("=")
                  .append(URLEncoder.encode(params.get(key), StandardCharsets.UTF_8).replace("+", "%20"));
            }
        }
        return sb.toString();
    }

    /**
     * Build chuỗi query string để gắn vào URL.
     * Rule: Cả Key và Value đều được URL Encode.
     */
    public static String buildQueryString(Map<String, String> params) {
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);
        StringBuilder sb = new StringBuilder();
        for (String key : keys) {
            if (params.get(key) != null && !params.get(key).isEmpty()) {
                if (sb.length() > 0) sb.append("&");
                sb.append(URLEncoder.encode(key, StandardCharsets.UTF_8).replace("+", "%20"))
                  .append("=")
                  .append(URLEncoder.encode(params.get(key), StandardCharsets.UTF_8).replace("+", "%20"));
            }
        }
        return sb.toString();
    }

    /**
     * Format thời gian theo chuẩn VNPay: yyyyMMddHHmmss
     */
    public static String getNow() {
        return new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
    }

    /**
     * Sinh mã giao dịch ngẫu nhiên (unique txn ref)
     * Định dạng: orderId + timestamp millis cuối 6 chữ số
     */
    public static String generateTxnRef(Long orderId) {
        String ts = String.valueOf(System.currentTimeMillis());
        return orderId + "_" + ts.substring(ts.length() - 6);
    }
}
