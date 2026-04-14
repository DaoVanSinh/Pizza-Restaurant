package com.pizza.restaurant.restaurant_backend.utils;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class RequestUtil {

    /**
     * Lấy thẻ HttpServletRequest của luồng hiện tại
     */
    public static HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            return attributes.getRequest();
        }
        return null;
    }

    /**
     * Lấy đúng địa chỉ nguồn (Origin) của Frontend.
     * Ví dụ: http://localhost:5173 hay https://mypizza.com
     */
    public static String getClientOrigin() {
        HttpServletRequest request = getCurrentRequest();
        if (request == null) {
            return "http://localhost:5173"; // Fallback an toàn
        }

        // Ưu tiên đọc Header Origin (được thiết lập trên các công cụ fetch/axios từ Web)
        String origin = request.getHeader("Origin");
        if (origin != null && !origin.isEmpty()) {
            return origin;
        }

        // Dự phòng bằng cách đọc Referer header (nếu Origin bị vắng)
        String referer = request.getHeader("Referer");
        if (referer != null && !referer.isEmpty()) {
            if (referer.endsWith("/")) {
                referer = referer.substring(0, referer.length() - 1);
            }
            return referer;
        }

        return "http://localhost:5173"; // Fallback tĩnh cuối cùng
    }
}
