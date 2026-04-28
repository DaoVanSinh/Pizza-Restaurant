package com.pizza.restaurant.restaurant_backend.security;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthFilter implements Filter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // ── Luon gan CORS headers (ke ca khi tra loi 401/403) ─────────────────
        String origin = httpRequest.getHeader("Origin");
        if (origin != null) {
            httpResponse.setHeader("Access-Control-Allow-Origin", origin);
            httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
            httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
            httpResponse.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With");
            httpResponse.setHeader("Vary", "Origin");
        }

        String path = httpRequest.getRequestURI();

        // Xu ly CORS Preflight request
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // Bo qua check JWT voi cac duong dan public
        if (isPublicPath(path)) {
            chain.doFilter(request, response);
            return;
        }

        // Kiem tra Header Authorization
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json;charset=UTF-8");
            httpResponse.getWriter().write("{\"error\": \"Unauthorized: Missing or invalid token\"}");
            return;
        }

        String token = authHeader.substring(7);

        // Validate Token
        if (!jwtUtil.validateToken(token)) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json;charset=UTF-8");
            httpResponse.getWriter().write("{\"error\": \"Unauthorized: Token expired or invalid\"}");
            return;
        }

        // Lay thong tin tu token va gan vao request attributes
        String role = jwtUtil.extractRole(token);
        httpRequest.setAttribute("userEmail", jwtUtil.extractEmail(token));
        httpRequest.setAttribute("userId",    jwtUtil.extractUserId(token));
        httpRequest.setAttribute("userRole",  role);

        // Chan quyen neu vao trang yeu cau admin nhung role la user
        if (isForbiddenForUser(path, role)) {
            httpResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
            httpResponse.setContentType("application/json;charset=UTF-8");
            httpResponse.getWriter().write("{\"error\": \"Forbidden: You don't have access privilege\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        // /auth/logout KHÔNG public — cần JWT để biết user nào đăng xuất
        if (path.equals("/api/v1/auth/logout")) return false;

        return path.startsWith("/api/v1/auth/") ||
               path.startsWith("/api/payment/vnpay/") ||
               // Client products: public cho moi nguoi (co hoac khong co ?category=...)
               path.startsWith("/api/v1/client/products") ||
               path.startsWith("/api/v1/categories") ||
               path.startsWith("/api/v1/variants") ||
               // Dashboard stats: read-only, khong can auth
               path.equals("/api/dashboard/stats") ||
               path.startsWith("/api/v1/images/") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs");
    }

    private boolean isForbiddenForUser(String path, String role) {
        // Chỉ ADMIN mới được quản lý tài khoản nhân viên/quản lý
        if (path.startsWith("/api/v1/admin/users")) {
            return !"admin".equalsIgnoreCase(role);
        }
        // Admin API khác (đơn hàng, sản phẩm, giao dịch...) → cả ADMIN lẫn STAFF được phép
        if (path.startsWith("/api/v1/admin/")) {
            return !("admin".equalsIgnoreCase(role) || "staff".equalsIgnoreCase(role));
        }
        return false;
    }
}
