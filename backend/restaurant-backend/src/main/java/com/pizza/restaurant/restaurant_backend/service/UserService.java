package com.pizza.restaurant.restaurant_backend.service;

import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
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
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Tên đăng nhập không được để trống!");
        }
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }
        if (user.getPhone() != null && !user.getPhone().isEmpty()
                && userRepository.findByPhone(user.getPhone()).isPresent()) {
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

    /**
     * Lấy danh sách tất cả nhân viên STAFF & quản lý ADMIN (trừ tài khoản chính - id=1)
     */
    public List<User> getStaffsAndAdmins() {
        List<User> staffs  = userRepository.findByRoleIgnoreCase("staff");
        List<User> admins  = userRepository.findByRoleIgnoreCase("admin");
        // Gộp và sắp xếp: admin trên cùng
        List<User> result = new java.util.ArrayList<>();
        result.addAll(admins);
        result.addAll(staffs);
        return result;
    }

    /**
     * Xóa user: ưu tiên soft-delete (set deleted_at).
     * Nếu không thành công do FK constraint, ném RuntimeException có message rõ ràng.
     */
    public void deleteUser(Long id) {
        if (id == 1L) {
            throw new RuntimeException("Không thể vô hiệu hóa tài khoản quản trị viên gốc (Super Admin)!");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
        // Soft delete: đặt deleted_at để vô hiệu hóa tài khoản
        user.setDeletedAt(Timestamp.from(Instant.now()));
        userRepository.save(user);
    }
}

