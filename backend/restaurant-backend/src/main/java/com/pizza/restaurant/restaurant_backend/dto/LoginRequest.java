package com.pizza.restaurant.restaurant_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Username/Email không được để trống")
    private String identifier;

    @NotBlank(message = "Password không được để trống")
    private String password;

    private Long guestCartId;
}
