package com.pizza.restaurant.restaurant_backend.controller.auth;

import com.pizza.restaurant.restaurant_backend.api.auth.AuthApi;
import com.pizza.restaurant.restaurant_backend.dto.AuthResponse;
import com.pizza.restaurant.restaurant_backend.dto.BaseResponse;
import com.pizza.restaurant.restaurant_backend.dto.LoginRequest;
import com.pizza.restaurant.restaurant_backend.dto.RegisterRequest;
import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.security.HashUtil;
import com.pizza.restaurant.restaurant_backend.security.JwtUtil;
import com.pizza.restaurant.restaurant_backend.service.AuthService;
import com.pizza.restaurant.restaurant_backend.service.EmailService;
import com.pizza.restaurant.restaurant_backend.service.RateLimitService;
import com.pizza.restaurant.restaurant_backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
public class AuthController implements AuthApi {

    private final AuthService authService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final RateLimitService rateLimitService;

    public AuthController(AuthService authService,
                          UserService userService,
                          JwtUtil jwtUtil,
                          EmailService emailService,
                          RateLimitService rateLimitService) {
        this.authService = authService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.rateLimitService = rateLimitService;
    }

    @Override
    public ResponseEntity<BaseResponse<AuthResponse>> login(LoginRequest request, HttpServletRequest httpRequest) {
        try {
            rateLimitService.check("login", clientKey(httpRequest, request.getIdentifier()), 5, Duration.ofMinutes(15));
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(BaseResponse.success(response, "Dang nhap thanh cong"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(BaseResponse.error(401, "Thong tin dang nhap khong hop le."));
        }
    }

    @Override
    public ResponseEntity<BaseResponse<AuthResponse>> register(RegisterRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setPassword(request.getPassword());
            user.setRole("user");

            User saved = userService.register(user);
            String token = jwtUtil.generateToken(saved);
            String refreshToken = jwtUtil.generateRefreshToken(saved);
            saved.setTokens(HashUtil.hashSHA256(refreshToken));
            userService.save(saved);

            AuthResponse response = new AuthResponse(
                    token, refreshToken, saved.getId(), saved.getUsername(),
                    saved.getEmail(), saved.getRole(), saved.getFullName(), null
            );
            return ResponseEntity.ok(BaseResponse.success(response, "Dang ky thanh cong"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(BaseResponse.error(400, e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<BaseResponse<String>> forgotPassword(com.pizza.restaurant.restaurant_backend.dto.ForgotPasswordRequest request,
                                                               HttpServletRequest httpRequest) {
        try {
            rateLimitService.check("forgot-password", clientKey(httpRequest, request.getEmail()), 3, Duration.ofMinutes(15));
            authService.processForgotPassword(request.getEmail(), emailService);
        } catch (RuntimeException e) {
            // Keep the response indistinguishable to avoid account enumeration.
        }
        return ResponseEntity.ok(BaseResponse.success(null, "Neu email ton tai, link khoi phuc mat khau se duoc gui den email do."));
    }

    @Override
    public ResponseEntity<BaseResponse<String>> resetPassword(com.pizza.restaurant.restaurant_backend.dto.ResetPasswordRequest request) {
        try {
            authService.processResetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(BaseResponse.success(null, "Mat khau da duoc dat lai thanh cong."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(BaseResponse.error(400, "Link khoi phuc khong hop le hoac da het han."));
        }
    }

    @Override
    public ResponseEntity<BaseResponse<AuthResponse>> refreshToken(com.pizza.restaurant.restaurant_backend.dto.RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshTokenFromDB(request.getRefreshToken());
            return ResponseEntity.ok(BaseResponse.success(response, "Lay access token moi thanh cong."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(BaseResponse.error(401, "Phien dang nhap khong hop le."));
        }
    }

    @Override
    public ResponseEntity<BaseResponse<String>> logout(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body(BaseResponse.error(401, "Unauthorized"));
            }
            authService.logout(userId);
            return ResponseEntity.ok(BaseResponse.success(null, "Dang xuat thanh cong."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(BaseResponse.error(500, "Khong the dang xuat."));
        }
    }

    private String clientKey(HttpServletRequest request, String identifier) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        } else if (ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip + ":" + identifier;
    }
}
