package com.pizza.restaurant.restaurant_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không định dạng đúng")
    private String email;
    
    // (Tuỳ chọn) origin dùng để ghép URL callback từ frontend nếu có
    private String origin;
}
