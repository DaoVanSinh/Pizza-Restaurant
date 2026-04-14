package com.pizza.restaurant.restaurant_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private Long userId;
    private String username;
    private String email;
    private String role;
    private String fullName;
    /**
     * URL avatar: /images/avatars/{avatarKey}
     */
    private String avatarUrl;
}
