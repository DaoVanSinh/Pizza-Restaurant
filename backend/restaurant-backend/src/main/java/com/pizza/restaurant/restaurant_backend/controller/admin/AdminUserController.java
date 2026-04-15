package com.pizza.restaurant.restaurant_backend.controller.admin;

import com.pizza.restaurant.restaurant_backend.api.admin.AdminUserApi;
import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AdminUserController implements AdminUserApi {

    @Autowired
    private UserService userService;

    @Override
    public ResponseEntity<List<User>> getAllStaffs() {
        return ResponseEntity.ok(userService.getStaffsAndAdmins());
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
        String role = user.getRole();
        // Cho phép tạo STAFF hoặc ADMIN (quản lý)
        if (role == null || (!role.equalsIgnoreCase("staff") && !role.equalsIgnoreCase("admin"))) {
            user.setRole("staff"); // mặc định là staff
        } else {
            user.setRole(role.toLowerCase()); // lưu lowercase: "admin" hoặc "staff"
        }

        try {
            User saved = userService.register(user);
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deleteUser(Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("Đã vô hiệu hóa tài khoản thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}


