package com.pizza.restaurant.restaurant_backend.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class HashUtil {

    /**
     * Mã hoá một chuỗi String sang định dạng SHA-256 (Hex string đúc xuất)
     * @param originalString Chuỗi cần mã hoá (Mật khẩu gốc)
     * @return Chuỗi đã mã hoá SHA-256 (64 ký tự)
     */
    public static String hashSHA256(String originalString) {
        if (originalString == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(originalString.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Cấu hình JVM thiếu thuật toán SHA-256", e);
        }
    }

    private static String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
