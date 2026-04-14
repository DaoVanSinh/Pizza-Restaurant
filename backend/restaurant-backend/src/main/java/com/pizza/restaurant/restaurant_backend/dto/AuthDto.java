package com.pizza.restaurant.restaurant_backend.dto;

import lombok.Data;

public class AuthDto {
    
    @Data
    public static class LoginRequest {
        private String identifier;
        private String password;
    }

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;
    }
}
