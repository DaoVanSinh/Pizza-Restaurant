package com.pizza.restaurant.restaurant_backend.api.admin;

import com.pizza.restaurant.restaurant_backend.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/v1/admin/users")
@Tag(name = "Admin Users", description = "Quản lý nhân viên và người dùng (Admin)")
public interface AdminUserApi {

    @Operation(summary = "Lấy danh sách tất cả nhân viên (Staff)")
    @GetMapping("/staffs")
    ResponseEntity<List<User>> getAllStaffs();

    @Operation(summary = "Lấy thông tin một User/Staff theo ID")
    @GetMapping("/{id}")
    ResponseEntity<User> getUserById(@PathVariable Long id);

    @Operation(summary = "Thêm nhân viên mới (Staff)")
    @PostMapping("/staffs")
    ResponseEntity<?> createStaff(@RequestBody User user);

    @Operation(summary = "Xóa người dùng hoặc nhân viên")
    @DeleteMapping("/{id}")
    ResponseEntity<?> deleteUser(@PathVariable Long id);
}
