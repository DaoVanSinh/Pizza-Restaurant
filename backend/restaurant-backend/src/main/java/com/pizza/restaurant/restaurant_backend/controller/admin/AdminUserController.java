package com.pizza.restaurant.restaurant_backend.controller.admin;

import com.pizza.restaurant.restaurant_backend.api.admin.AdminUserApi;
import com.pizza.restaurant.restaurant_backend.dto.UserResponseDTO;
import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AdminUserController implements AdminUserApi {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @Override
    public ResponseEntity<List<UserResponseDTO>> getAllStaffs() {
        return ResponseEntity.ok(userService.getStaffsAndAdmins().stream()
                .map(UserResponseDTO::from)
                .toList());
    }

    @Override
    public ResponseEntity<UserResponseDTO> getUserById(Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(UserResponseDTO.from(user));
    }

    @Override
    public ResponseEntity<?> createStaff(User user) {
        String role = user.getRole();
        if (role == null || (!role.equalsIgnoreCase("staff") && !role.equalsIgnoreCase("admin"))) {
            user.setRole("staff");
        } else {
            user.setRole(role.toLowerCase());
        }

        try {
            User saved = userService.register(user);
            return ResponseEntity.ok(UserResponseDTO.from(saved));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deleteUser(Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("Account disabled.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
