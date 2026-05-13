package com.pizza.restaurant.restaurant_backend.controller.client;

import com.pizza.restaurant.restaurant_backend.api.client.ClientProfileApi;
import com.pizza.restaurant.restaurant_backend.model.Profile;
import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.repository.ProfileRepository;
import com.pizza.restaurant.restaurant_backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController

public class ClientProfileController implements ClientProfileApi {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.pizza.restaurant.restaurant_backend.service.FileStorageService fileStorageService;

    @Override
    public ResponseEntity<Profile> uploadAvatar(jakarta.servlet.http.HttpServletRequest request, org.springframework.web.multipart.MultipartFile image) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        Profile profile = profileRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return null;
            Profile newProfile = new Profile();
            newProfile.setUser(user);
            return profileRepository.save(newProfile);
        });

        if (profile == null) return ResponseEntity.notFound().build();

        if (image != null && !image.isEmpty()) {
            try {
                String imageKey = fileStorageService.saveFile(image, "avatars");
                profile.setAvatar(imageKey);
                return ResponseEntity.ok(profileRepository.save(profile));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            } catch (java.io.IOException e) {
                return ResponseEntity.status(500).build();
            }
        }

        return ResponseEntity.badRequest().build();
    }

    @Override
    public ResponseEntity<Profile> getMyProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        Profile profile = profileRepository.findByUserId(userId).orElseGet(() -> {
            // Nếu chưa có profile, tự động tạo mới
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return null;

            Profile newProfile = new Profile();
            newProfile.setUser(user);
            return profileRepository.save(newProfile);
        });

        if (profile == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(profile);
    }

    @Override
    public ResponseEntity<Profile> updateMyProfile(HttpServletRequest request, java.util.Map<String, Object> payload) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        Profile profile = profileRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return null;
            Profile newProfile = new Profile();
            newProfile.setUser(user);
            return profileRepository.save(newProfile);
        });
        
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        if (payload.containsKey("fullName") && payload.get("fullName") != null) {
            profile.setFullName(payload.get("fullName").toString());
        }
        if (payload.containsKey("address") && payload.get("address") != null) {
            profile.setAddress(payload.get("address").toString());
        }
        // Handle phone (it could be direct "phone" or nested inside "user": {"phone": "..."} depending on payload
        String newPhone = null;
        if (payload.containsKey("phone") && payload.get("phone") != null) {
            newPhone = payload.get("phone").toString();
        } else if (payload.containsKey("user") && payload.get("user") instanceof java.util.Map) {
            java.util.Map<?, ?> userMap = (java.util.Map<?, ?>) payload.get("user");
            if (userMap.containsKey("phone") && userMap.get("phone") != null) {
                newPhone = userMap.get("phone").toString();
            }
        }

        if (newPhone != null) {
            User userObj = profile.getUser();
            if (userObj != null) {
                userObj.setPhone(newPhone);
                userRepository.save(userObj);
            }
        }

        return ResponseEntity.ok(profileRepository.save(profile));
    }
}

