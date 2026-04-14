package com.pizza.restaurant.restaurant_backend.security;

import com.pizza.restaurant.restaurant_backend.utils.LogUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

@Component
public class RoleInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
        }

        // Bỏ qua nếu API không yêu cầu role
        if (requireRole == null || requireRole.value().length == 0) {
            return true;
        }

        // --- Validate Role ---
        // TODO: Lấy Role thực tế của User từ JWT Token header (ví dụ Authorization: Bearer ...)
        // Giả lập ở bước này: Có thể trích xuất "X-User-Role" từ request attribute hoặc Header.
        String userRole = request.getHeader("X-User-Role"); // Thay bằng JwtUtil.extractRole()

        if (userRole == null || userRole.isEmpty()) {
            LogUtil.warn("Truy cập bị từ chối: Missing authentication context.");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"status\": 401, \"message\": \"Vui lòng đăng nhập\"}");
            return false;
        }

        boolean hasRole = Arrays.asList(requireRole.value()).contains(userRole);
        if (!hasRole) {
            LogUtil.error("Truy cập bị từ chối: Required roles " + Arrays.toString(requireRole.value()) + ", but user has '" + userRole + "'");
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"status\": 403, \"message\": \"Bạn không có quyền thực hiện hành động này\"}");
            return false;
        }

        return true;
    }
}
