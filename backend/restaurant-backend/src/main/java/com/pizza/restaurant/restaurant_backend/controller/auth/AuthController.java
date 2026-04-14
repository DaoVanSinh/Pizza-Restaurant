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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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

    @Autowired
    private com.pizza.restaurant.restaurant_backend.repository.UserRepository userRepository;

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
            String token = jwtUtil.generateToken(saved);
            String refreshToken = jwtUtil.generateRefreshToken(saved);
            
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
            String refreshToken = request.getRefreshToken();
            
            if (refreshToken == null || !jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
                throw new RuntimeException("Refresh token không hợp lệ hoặc đã hết hạn.");
            }

            String email = jwtUtil.extractEmail(refreshToken);
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User không tồn tại"));

            // Generate Token Mới
            String newToken = jwtUtil.generateToken(user);
            // Optionally: Sinh cả refresh token mới (tuỳ chiến lược, dùng chung hoặc cuốn xoá)
            String newRefreshToken = jwtUtil.generateRefreshToken(user);

            AuthResponse response = new AuthResponse(
                    newToken, newRefreshToken, user.getId(), user.getUsername(),
                    user.getEmail(), user.getRole(), null, null
            );
            return ResponseEntity.ok(BaseResponse.success(response, "Lấy Access Token mới thành công."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(BaseResponse.error(401, e.getMessage()));
        }
    }
}

