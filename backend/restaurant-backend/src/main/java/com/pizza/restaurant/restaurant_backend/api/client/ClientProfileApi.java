package com.pizza.restaurant.restaurant_backend.api.client;

import com.pizza.restaurant.restaurant_backend.model.Profile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/v1/client/profile")
@Tag(name = "Client Profile", description = "Xem và sửa hồ sơ cá nhân (Yêu cầu đăng nhập)")
public interface ClientProfileApi {

    @Operation(summary = "Lấy hồ sơ cá nhân hiện tại")
    @GetMapping
    ResponseEntity<Profile> getMyProfile(jakarta.servlet.http.HttpServletRequest request);

    @Operation(summary = "Cập nhật hồ sơ cá nhân")
    @PutMapping
    ResponseEntity<Profile> updateMyProfile(
            jakarta.servlet.http.HttpServletRequest request,
            @RequestBody java.util.Map<String, Object> payload);

    @Operation(summary = "Tải lên ảnh đại diện")
    @PostMapping(value = "/avatar", consumes = {"multipart/form-data"})
    ResponseEntity<Profile> uploadAvatar(
            jakarta.servlet.http.HttpServletRequest request,
            @RequestPart("image") org.springframework.web.multipart.MultipartFile image);
}
