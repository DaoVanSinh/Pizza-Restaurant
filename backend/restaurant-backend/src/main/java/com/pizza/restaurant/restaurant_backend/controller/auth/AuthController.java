package com.pizza.restaurant.restaurant_backend.controller.auth;

import com.pizza.restaurant.restaurant_backend.api.auth.AuthApi;
import com.pizza.restaurant.restaurant_backend.dto.AuthResponse;
import com.pizza.restaurant.restaurant_backend.dto.BaseResponse;
import com.pizza.restaurant.restaurant_backend.dto.LoginRequest;
import com.pizza.restaurant.restaurant_backend.dto.RegisterRequest;
import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.security.JwtUtil;
import com.pizza.restaurant.restaurant_backend.service.AuthService;
import com.pizza.restaurant.restaurant_backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController

public class AuthController implements AuthApi {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.pizza.restaurant.restaurant_backend.service.EmailService emailService;

    @Override
    public ResponseEntity<BaseResponse<AuthResponse>> login(LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(BaseResponse.success(response, "Đăng nhập thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(BaseResponse.error(401, e.getMessage()));
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
            String token        = jwtUtil.generateToken(saved);
            String refreshToken = jwtUtil.generateRefreshToken(saved);

            // Lưu hash vào DB (nhất quán với login)
            saved.setTokens(com.pizza.restaurant.restaurant_backend.security.HashUtil.hashSHA256(refreshToken));
            userService.save(saved);

            AuthResponse response = new AuthResponse(
                    token, refreshToken, saved.getId(), saved.getUsername(),
                    saved.getEmail(), saved.getRole(), null, null
            );
            return ResponseEntity.ok(BaseResponse.success(response, "Đăng ký thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(BaseResponse.error(400, e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<BaseResponse<String>> forgotPassword(com.pizza.restaurant.restaurant_backend.dto.ForgotPasswordRequest request) {
        try {
            authService.processForgotPassword(request.getEmail(), request.getOrigin(), emailService);
            return ResponseEntity.ok(BaseResponse.success(null, "Link khôi phục mật khẩu đã được gửi đến email của bạn."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(BaseResponse.error(400, e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<BaseResponse<String>> resetPassword(com.pizza.restaurant.restaurant_backend.dto.ResetPasswordRequest request) {
        try {
            authService.processResetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(BaseResponse.success(null, "Mật khẩu của bạn đã được đặt lại thành công."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(BaseResponse.error(400, e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<BaseResponse<AuthResponse>> refreshToken(com.pizza.restaurant.restaurant_backend.dto.RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshTokenFromDB(request.getRefreshToken());
            return ResponseEntity.ok(BaseResponse.success(response, "Lấy Access Token mới thành công."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(BaseResponse.error(401, e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<BaseResponse<String>> logout(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body(BaseResponse.error(401, "Không xác định được người dùng."));
            }
            authService.logout(userId);
            return ResponseEntity.ok(BaseResponse.success(null, "Đăng xuất thành công."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(BaseResponse.error(500, e.getMessage()));
        }
    }
}
