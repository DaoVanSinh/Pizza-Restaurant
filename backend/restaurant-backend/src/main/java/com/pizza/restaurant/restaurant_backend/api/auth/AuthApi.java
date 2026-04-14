package com.pizza.restaurant.restaurant_backend.api.auth;

import com.pizza.restaurant.restaurant_backend.dto.AuthResponse;
import com.pizza.restaurant.restaurant_backend.dto.BaseResponse;
import com.pizza.restaurant.restaurant_backend.dto.LoginRequest;
import com.pizza.restaurant.restaurant_backend.dto.RegisterRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "API Xác thực người dùng (Public)")
public interface AuthApi {

    @Operation(summary = "Đăng nhập")
    @PostMapping("/login")
    ResponseEntity<BaseResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request);

    @Operation(summary = "Đăng ký")
    @PostMapping("/register")
    ResponseEntity<BaseResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request);
    @Operation(summary = "Quên mật khẩu", description = "Gửi link khôi phục mật khẩu vào email")
    @PostMapping("/forgot-password")
    ResponseEntity<BaseResponse<String>> forgotPassword(@Valid @RequestBody com.pizza.restaurant.restaurant_backend.dto.ForgotPasswordRequest request);

    @Operation(summary = "Đặt lại mật khẩu", description = "Sử dụng token được gửi từ email để đặt lại mật khẩu mới")
    @PostMapping("/reset-password")
    ResponseEntity<BaseResponse<String>> resetPassword(@Valid @RequestBody com.pizza.restaurant.restaurant_backend.dto.ResetPasswordRequest request);

    @Operation(summary = "Làm mới Access Token", description = "Dùng Refresh Token để đổi lấy Access Token mới")
    @PostMapping("/refresh-token")
    ResponseEntity<BaseResponse<AuthResponse>> refreshToken(@Valid @RequestBody com.pizza.restaurant.restaurant_backend.dto.RefreshTokenRequest request);
}
