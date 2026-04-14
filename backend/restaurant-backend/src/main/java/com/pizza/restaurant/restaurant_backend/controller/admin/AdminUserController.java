package com.pizza.restaurant.restaurant_backend.controller.admin;

import com.pizza.restaurant.restaurant_backend.api.admin.AdminUserApi;
import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController

public class AdminUserController implements AdminUserApi {

    @Autowired
    private UserService userService;

    @Override
    public ResponseEntity<List<User>> getAllStaffs() {
        return ResponseEntity.ok(userService.getStaffs());
    }

    @Override
    public ResponseEntity<User> getUserById(Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @Override
    public ResponseEntity<?> createStaff(User user) {
        user.setRole("staff"); // Ép kiểu role staff
        try {
            User saved = userService.register(user);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deleteUser(Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Deleted successfully!");
    }
}

