package com.pizza.restaurant.restaurant_backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String phone;
    private String password;
    private String fullName;
}
