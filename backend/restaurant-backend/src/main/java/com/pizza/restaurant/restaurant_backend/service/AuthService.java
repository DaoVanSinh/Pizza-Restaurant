package com.pizza.restaurant.restaurant_backend.service;

import com.pizza.restaurant.restaurant_backend.dto.AuthResponse;
import com.pizza.restaurant.restaurant_backend.dto.LoginRequest;
import com.pizza.restaurant.restaurant_backend.model.Cart;
import com.pizza.restaurant.restaurant_backend.model.CartItem;
import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.repository.CartItemRepository;
import com.pizza.restaurant.restaurant_backend.repository.CartRepository;
import com.pizza.restaurant.restaurant_backend.repository.UserRepository;
import com.pizza.restaurant.restaurant_backend.security.HashUtil;
import com.pizza.restaurant.restaurant_backend.security.JwtUtil;
import com.pizza.restaurant.restaurant_backend.utils.LogUtil;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    private static final String INVALID_LOGIN_MESSAGE = "Thong tin dang nhap khong hop le.";
    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder(12);
    private static final String DUMMY_PASSWORD_HASH = PASSWORD_ENCODER.encode("invalid-password");

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.jwtUtil = jwtUtil;
    }

    public static String encodePassword(String rawPassword) {
        return PASSWORD_ENCODER.encode(rawPassword);
    }

    public static boolean matchPassword(String rawPassword, String encodedPassword) {
        return PASSWORD_ENCODER.matches(rawPassword, encodedPassword);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getIdentifier())
                .or(() -> userRepository.findByUsername(request.getIdentifier()))
                .or(() -> userRepository.findByPhone(request.getIdentifier()))
                .orElse(null);

        if (user == null) {
            PASSWORD_ENCODER.matches(request.getPassword(), DUMMY_PASSWORD_HASH);
            LogUtil.warn("Login failed for identifier: " + request.getIdentifier());
            throw new RuntimeException(INVALID_LOGIN_MESSAGE);
        }

        if (user.getDeletedAt() != null) {
            LogUtil.warn("Login blocked for disabled account: " + request.getIdentifier());
            throw new RuntimeException(INVALID_LOGIN_MESSAGE);
        }

        if (!PASSWORD_ENCODER.matches(request.getPassword(), user.getPassword())) {
            LogUtil.warn("Login failed for identifier: " + request.getIdentifier());
            throw new RuntimeException(INVALID_LOGIN_MESSAGE);
        }

        if (request.getGuestCartId() != null) {
            mergeCart(user, request.getGuestCartId());
        }

        String token = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        user.setTokens(HashUtil.hashSHA256(refreshToken));
        userRepository.save(user);

        LogUtil.info("User '" + user.getUsername() + "' logged in.");
        return toAuthResponse(user, token, refreshToken);
    }

    private void mergeCart(User user, Long guestCartId) {
        Optional<Cart> optGuestCart = cartRepository.findById(guestCartId);
        if (optGuestCart.isEmpty()) return;

        Cart guestCart = optGuestCart.get();
        if (guestCart.getUser() != null) {
            LogUtil.warn("Cart " + guestCartId + " belongs to another user; skip merge.");
            return;
        }

        Cart userCart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setUser(user);
                    return cartRepository.save(c);
                });

        List<CartItem> guestItems = cartItemRepository.findByCart(guestCart);
        for (CartItem guestItem : guestItems) {
            cartItemRepository
                    .findByCartAndProduct(userCart, guestItem.getProduct())
                    .ifPresentOrElse(
                            existing -> {
                                existing.setAmount(existing.getAmount() + guestItem.getAmount());
                                cartItemRepository.save(existing);
                                cartItemRepository.delete(guestItem);
                            },
                            () -> {
                                guestItem.setCart(userCart);
                                cartItemRepository.save(guestItem);
                            }
                    );
        }

        cartRepository.delete(guestCart);
        LogUtil.info("Merged guest cart [" + guestCartId + "] into user cart [" + userCart.getId() + "]");
    }

    @Transactional
    public void logout(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setTokens(null);
            userRepository.save(user);
            LogUtil.info("User '" + user.getUsername() + "' logged out.");
        });
    }

    @Transactional
    public AuthResponse refreshTokenFromDB(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid session.");
        }

        String email = jwtUtil.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid session."));

        if (user.getDeletedAt() != null) {
            throw new RuntimeException("Invalid session.");
        }

        String hashedIncoming = HashUtil.hashSHA256(refreshToken);
        if (user.getTokens() == null || !user.getTokens().equals(hashedIncoming)) {
            throw new RuntimeException("Invalid session.");
        }

        String newAccessToken = jwtUtil.generateToken(user);
        String newRefreshToken = jwtUtil.generateRefreshToken(user);
        user.setTokens(HashUtil.hashSHA256(newRefreshToken));
        userRepository.save(user);

        LogUtil.info("Refresh token rotated for user '" + user.getUsername() + "'.");
        return toAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Transactional
    public void processForgotPassword(String email, EmailService emailService, String resetBaseUrl) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || userOpt.get().getDeletedAt() != null) {
            LogUtil.warn("Password reset requested for non-existing or disabled email: " + email);
            throw new RuntimeException("Email không tồn tại trong hệ thống hoặc đã bị khóa!");
        }

        User user = userOpt.get();

        // Nếu request gửi từ Admin Portal, bắt buộc user phải là admin hoặc staff
        if (resetBaseUrl != null && resetBaseUrl.contains("5174")) {
            if (!"admin".equalsIgnoreCase(user.getRole()) && !"staff".equalsIgnoreCase(user.getRole())) {
                throw new RuntimeException("Tài khoản không hợp lệ!");
            }
        }

        String resetToken = jwtUtil.generateResetToken(user);
        user.setResetTokenHash(HashUtil.hashSHA256(resetToken));
        user.setResetTokenExpiresAt(Timestamp.from(Instant.ofEpochMilli(jwtUtil.extractExpiration(resetToken).getTime())));
        userRepository.save(user);

        emailService.sendResetPasswordMail(user.getEmail(), user.getUsername(), resetToken, resetBaseUrl);
        LogUtil.info("Password reset email queued for user id " + user.getId());
    }

    @Transactional
    public void processResetPassword(String token, String newPassword) {
        if (!jwtUtil.validateToken(token) || !jwtUtil.isResetToken(token)) {
            throw new RuntimeException("Invalid or expired reset link.");
        }

        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link."));

        String tokenHash = HashUtil.hashSHA256(token);
        Timestamp expiresAt = user.getResetTokenExpiresAt();
        if (user.getResetTokenHash() == null ||
                !user.getResetTokenHash().equals(tokenHash) ||
                expiresAt == null ||
                expiresAt.before(Timestamp.from(Instant.now()))) {
            throw new RuntimeException("Invalid or expired reset link.");
        }

        user.setPassword(encodePassword(newPassword));
        user.setResetTokenHash(null);
        user.setResetTokenExpiresAt(null);
        user.setTokens(null);
        userRepository.save(user);

        LogUtil.info("Password reset completed for user id " + user.getId());
    }

    private AuthResponse toAuthResponse(User user, String token, String refreshToken) {
        return new AuthResponse(
                token,
                refreshToken,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getFullName(),
                null
        );
    }
}
