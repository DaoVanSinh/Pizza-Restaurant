package com.pizza.restaurant.restaurant_backend.api.auth;

import com.pizza.restaurant.restaurant_backend.dto.AuthResponse;
import com.pizza.restaurant.restaurant_backend.dto.BaseResponse;
import com.pizza.restaurant.restaurant_backend.dto.LoginRequest;
import com.pizza.restaurant.restaurant_backend.dto.RegisterRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "Authentication API")
public interface AuthApi {

    @Operation(summary = "Login")
    @PostMapping("/login")
    ResponseEntity<BaseResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest);

    @Operation(summary = "Register")
    @PostMapping("/register")
    ResponseEntity<BaseResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request);

    @Operation(summary = "Forgot password")
    @PostMapping("/forgot-password")
    ResponseEntity<BaseResponse<String>> forgotPassword(@Valid @RequestBody com.pizza.restaurant.restaurant_backend.dto.ForgotPasswordRequest request, HttpServletRequest httpRequest);

    @Operation(summary = "Reset password")
    @PostMapping("/reset-password")
    ResponseEntity<BaseResponse<String>> resetPassword(@Valid @RequestBody com.pizza.restaurant.restaurant_backend.dto.ResetPasswordRequest request);

    @Operation(summary = "Refresh access token")
    @PostMapping("/refresh-token")
    ResponseEntity<BaseResponse<AuthResponse>> refreshToken(@Valid @RequestBody com.pizza.restaurant.restaurant_backend.dto.RefreshTokenRequest request);

    @Operation(summary = "Logout")
    @PostMapping("/logout")
    ResponseEntity<BaseResponse<String>> logout(HttpServletRequest request);
}
