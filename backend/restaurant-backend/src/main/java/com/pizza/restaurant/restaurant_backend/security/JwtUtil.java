package com.pizza.restaurant.restaurant_backend.security;

import com.pizza.restaurant.restaurant_backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT Utility
 * ─────────────────────────────────────────────
 * Algorithm  : HMAC-SHA256 (HS256)
 * Secret key : từ .env → JWT_SECRET
 * Subject    : email của user
 * Claims     : userId, username, role
 * Expiry     : 24 giờ (configurable)
 */
@Component
public class JwtUtil {

    @Value("${JWT_SECRET}")
    private String SECRET_STRING;

    /** 24 giờ tính bằng ms */
    private static final long ACCESS_TOKEN_EXPIRY  = 24 * 60 * 60 * 1000L;

    /** 15 phút tính bằng ms — dùng cho reset-password link */
    private static final long RESET_TOKEN_EXPIRY   = 15 * 60 * 1000L;

    // ─── Key ────────────────────────────────────────────────────────
    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(SECRET_STRING.getBytes());
    }

    // ─── Generate ───────────────────────────────────────────────────

    /**
     * Sinh Access Token cho user đăng nhập thành công.
     * Ký bằng HMAC-SHA256 (HS256).
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId",   user.getId());
        claims.put("username", user.getUsername());
        claims.put("role",     user.getRole());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())          // subject = email
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRY))
                .signWith(getSecretKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Sinh Refresh Token (7 ngày).
     * Claim "purpose" = "refresh"
     */
    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("purpose", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000L))
                .signWith(getSecretKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Sinh Reset-Password Token (15 phút).
     * Claim "purpose" = "reset_password" để phân biệt với access token.
     */
    public String generateResetToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("purpose", "reset_password")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + RESET_TOKEN_EXPIRY))
                .signWith(getSecretKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ─── Extract ────────────────────────────────────────────────────

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        Object userId = getClaims(token).get("userId");
        return userId instanceof Number ? ((Number) userId).longValue() : null;
    }

    public String extractUsername(String token) {
        return (String) getClaims(token).get("username");
    }

    public String extractRole(String token) {
        return (String) getClaims(token).get("role");
    }

    // ─── Validate ───────────────────────────────────────────────────

    /** Token hợp lệ và chưa hết hạn */
    public boolean validateToken(String token) {
        try {
            return !getClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    /** Kiểm tra token này có phải Reset Token không */
    public boolean isResetToken(String token) {
        try {
            return "reset_password".equals(getClaims(token).get("purpose"));
        } catch (Exception e) {
            return false;
        }
    }

    /** Kiểm tra token này có phải Refresh Token không */
    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(getClaims(token).get("purpose"));
        } catch (Exception e) {
            return false;
        }
    }

    // ─── Internal ───────────────────────────────────────────────────
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSecretKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
