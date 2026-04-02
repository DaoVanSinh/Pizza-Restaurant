package com.pizza.restaurant.restaurant_backend.repository;

import com.pizza.restaurant.restaurant_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    // Tìm người dùng theo số điện thoại để Đăng nhập
    Optional<User> findByPhone(String phone);
    
    // Lọc danh sách theo vai trò
    List<User> findByRole(String role);
    
    // Tìm kiếm nhân viên theo tên hoặc số điện thoại
    List<User> findByFullNameContainingIgnoreCaseOrPhoneContaining(String name, String phone);
    
    // Khai báo hàm này để đếm số lượng khách hàng (USER)
    long countByRole(String role);
}
