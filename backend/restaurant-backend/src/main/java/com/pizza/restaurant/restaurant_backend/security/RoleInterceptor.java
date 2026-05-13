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
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
        }

        if (requireRole == null || requireRole.value().length == 0) {
            return true;
        }

        String userRole = (String) request.getAttribute("userRole");
        if (userRole == null || userRole.isBlank()) {
            LogUtil.warn("Access denied: missing authentication context.");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"status\":401,\"message\":\"Unauthorized\"}");
            return false;
        }

        boolean hasRole = Arrays.stream(requireRole.value())
                .anyMatch(requiredRole -> requiredRole.equalsIgnoreCase(userRole));
        if (!hasRole) {
            LogUtil.error("Access denied: required roles " + Arrays.toString(requireRole.value()) + ", user role " + userRole);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"status\":403,\"message\":\"Forbidden\"}");
            return false;
        }

        return true;
    }
}
