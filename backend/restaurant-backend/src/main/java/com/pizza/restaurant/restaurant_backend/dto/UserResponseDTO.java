package com.pizza.restaurant.restaurant_backend.dto;

import com.pizza.restaurant.restaurant_backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private String phone;
    private Timestamp createdAt;
    private Timestamp deletedAt;

    public static UserResponseDTO from(User user) {
        if (user == null) return null;
        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getPhone(),
                user.getCreatedAt(),
                user.getDeletedAt()
        );
    }
}
