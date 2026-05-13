package com.pizza.restaurant.restaurant_backend.api.admin;

import com.pizza.restaurant.restaurant_backend.dto.UserResponseDTO;
import com.pizza.restaurant.restaurant_backend.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/v1/admin/users")
@Tag(name = "Admin Users", description = "Admin user management")
public interface AdminUserApi {

    @Operation(summary = "List staff and admins")
    @GetMapping
    ResponseEntity<List<UserResponseDTO>> getAllStaffs();

    @Operation(summary = "Get user by id")
    @GetMapping("/{id}")
    ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id);

    @Operation(summary = "Create staff or admin")
    @PostMapping("/register")
    ResponseEntity<?> createStaff(@RequestBody User user);

    @Operation(summary = "Disable user")
    @DeleteMapping("/{id}")
    ResponseEntity<?> deleteUser(@PathVariable Long id);
}
