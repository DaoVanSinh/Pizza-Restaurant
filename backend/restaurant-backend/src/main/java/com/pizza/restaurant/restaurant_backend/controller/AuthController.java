package com.pizza.restaurant.restaurant_backend.controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        // Kiểm tra phone và password trong MySQL
        // Trả về role (ADMIN/USER)
        return "Đăng nhập thành công";
    }
}
