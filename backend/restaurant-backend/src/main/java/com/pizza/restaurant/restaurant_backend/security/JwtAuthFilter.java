package com.pizza.restaurant.restaurant_backend.security;

import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.repository.UserRepository;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

@Component
public class JwtAuthFilter implements Filter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final String allowedOrigins;

    public JwtAuthFilter(JwtUtil jwtUtil,
                         UserRepository userRepository,
                         @Value("${app.cors.allowed-origins}") String allowedOrigins) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        applySecurityHeaders(httpResponse);
        applyCorsHeaders(httpRequest, httpResponse);

        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String path = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();

        if (isPublicPath(method, path)) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            writeError(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            writeError(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }

        Long tokenUserId = jwtUtil.extractUserId(token);
        Optional<User> userOpt = tokenUserId != null
                ? userRepository.findById(tokenUserId)
                : userRepository.findByEmail(jwtUtil.extractEmail(token));

        if (userOpt.isEmpty() || userOpt.get().getDeletedAt() != null) {
            writeError(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }

        User user = userOpt.get();
        String role = user.getRole();

        httpRequest.setAttribute("userEmail", user.getEmail());
        httpRequest.setAttribute("userId", user.getId());
        httpRequest.setAttribute("userRole", role);

        if (!hasRequiredRole(method, path, role)) {
            writeError(httpResponse, HttpServletResponse.SC_FORBIDDEN, "Forbidden");
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isPublicPath(String method, String path) {
        if ("POST".equalsIgnoreCase(method) && (
                path.equals("/api/v1/auth/login") ||
                path.equals("/api/v1/auth/register") ||
                path.equals("/api/v1/auth/forgot-password") ||
                path.equals("/api/v1/auth/reset-password") ||
                path.equals("/api/v1/auth/refresh-token"))) {
            return true;
        }

        return ("GET".equalsIgnoreCase(method) && (
                    path.startsWith("/api/v1/client/products") ||
                    path.startsWith("/api/v1/categories") ||
                    path.startsWith("/api/v1/variants") ||
                    path.startsWith("/api/v1/images/") ||
                    path.equals("/api/v1/payment/vnpay/return") ||
                    path.startsWith("/swagger-ui") ||
                    path.startsWith("/v3/api-docs")
                ));
    }

    private boolean hasRequiredRole(String method, String path, String role) {
        if (path.startsWith("/api/v1/admin/users")) {
            return hasAnyRole(role, "admin");
        }

        if (path.startsWith("/api/v1/admin/") || path.startsWith("/api/dashboard/")) {
            return hasAnyRole(role, "admin", "staff");
        }

        if (path.startsWith("/api/v1/categories") && !"GET".equalsIgnoreCase(method)) {
            return hasAnyRole(role, "admin", "staff");
        }

        return true;
    }

    private boolean hasAnyRole(String role, String... allowed) {
        return role != null && Arrays.stream(allowed).anyMatch(allowedRole -> allowedRole.equalsIgnoreCase(role));
    }

    private void applyCorsHeaders(HttpServletRequest request, HttpServletResponse response) {
        String origin = request.getHeader("Origin");
        if (origin == null || !isAllowedOrigin(origin)) {
            return;
        }

        response.setHeader("Access-Control-Allow-Origin", origin);
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With");
        response.setHeader("Vary", "Origin");
    }

    private boolean isAllowedOrigin(String origin) {
        return Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty() && !"*".equals(value))
                .anyMatch(origin::equals);
    }

    private void applySecurityHeaders(HttpServletResponse response) {
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
        response.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    }

    private void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"status\":" + status + ",\"message\":\"" + message + "\"}");
    }
}
