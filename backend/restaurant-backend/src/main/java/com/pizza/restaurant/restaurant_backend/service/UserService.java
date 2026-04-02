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
        // Mặc định là USER nếu không chỉ định, mật khẩu nên được mã hóa ở bước tiếp theo
        if (user.getRole() == null) user.setRole("USER");
        return userRepository.save(user);
    }

    public List<User> getStaffs() {
        return userRepository.findByRole("STAFF");
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
