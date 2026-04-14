package com.pizza.restaurant.restaurant_backend.service;

import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User register(User user) {
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email không được để trống!");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng!");
        }
        if (user.getPhone() != null && userRepository.findByPhone(user.getPhone()).isPresent()) {
            throw new RuntimeException("Số điện thoại đã tồn tại!");
        }

        if (user.getRole() == null) user.setRole("user");

        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(AuthService.encodePassword(user.getPassword()));
        }

        return userRepository.save(user);
    }

    public boolean resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return false;

        user.setPassword(AuthService.encodePassword(newPassword));
        userRepository.save(user);
        return true;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<User> getStaffs() {
        return userRepository.findByRole("STAFF");
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
