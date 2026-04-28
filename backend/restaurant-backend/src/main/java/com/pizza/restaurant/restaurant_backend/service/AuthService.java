package com.pizza.restaurant.restaurant_backend.service;

import com.pizza.restaurant.restaurant_backend.dto.LoginRequest;
import com.pizza.restaurant.restaurant_backend.dto.AuthResponse;
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

import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final JwtUtil jwtUtil;

    // BCrypt — strength 12 (cân bằng bảo mật vs tốc độ)
    private static final BCryptPasswordEncoder PASSWORD_ENCODER =
            new BCryptPasswordEncoder(12);

    public AuthService(UserRepository userRepository,
                       CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.jwtUtil = jwtUtil;
    }

    // ─── Tiện ích dùng chung cho UserService ────────────────────────
    public static String encodePassword(String rawPassword) {
        return PASSWORD_ENCODER.encode(rawPassword);
    }

    public static boolean matchPassword(String rawPassword, String encodedPassword) {
        return PASSWORD_ENCODER.matches(rawPassword, encodedPassword);
    }

    // ─── Login ──────────────────────────────────────────────────────
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Tìm user theo email, username hoặc phone
        User user = userRepository.findByEmail(request.getIdentifier())
                .or(() -> userRepository.findByUsername(request.getIdentifier()))
                .or(() -> userRepository.findByPhone(request.getIdentifier()))
                .orElseThrow(() -> {
                    LogUtil.error("Login failed: not found — " + request.getIdentifier());
                    return new RuntimeException("Tài khoản không tồn tại");
                });

        //  Từ chối tài khoản đã bị vô hiệu hóa (admin xóa)
        if (user.getDeletedAt() != null) {
            LogUtil.warn("Login blocked: account disabled — " + request.getIdentifier());
            throw new RuntimeException("Tài khoản này đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
        }

        //  BCrypt verify — an toàn, chống timing attack
        if (!PASSWORD_ENCODER.matches(request.getPassword(), user.getPassword())) {
            LogUtil.error("Login failed: wrong password — " + request.getIdentifier());
            throw new RuntimeException("Sai mật khẩu");
        }

        // Merge guest cart nếu có
        if (request.getGuestCartId() != null) {
            mergeCart(user, request.getGuestCartId());
        }

        //  JWT thật
        String token = jwtUtil.generateToken(user);

        //  Refresh Token — sinh mới và lưu hash vào DB
        String refreshToken = jwtUtil.generateRefreshToken(user);
        user.setTokens(HashUtil.hashSHA256(refreshToken));
        userRepository.save(user);

        LogUtil.info("User '" + user.getUsername() + "' logged in.");
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

    // ─── Merge guest cart → user cart ───────────────────────────────
    private void mergeCart(User user, Long guestCartId) {
        Optional<Cart> optGuestCart = cartRepository.findById(guestCartId);
        if (optGuestCart.isEmpty()) return;

        Cart guestCart = optGuestCart.get();
        if (guestCart.getUser() != null) {
            LogUtil.warn("Cart " + guestCartId + " belongs to another user — skip merge.");
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
        LogUtil.info("Merged guest cart [" + guestCartId + "] → user cart [" + userCart.getId() + "]");
    }

    // ─── Logout ──────────────────────────────────────────────────────
    @Transactional
    public void logout(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setTokens(null);
            userRepository.save(user);
            LogUtil.info("User '" + user.getUsername() + "' logged out — token revoked.");
        });
    }

    // ─── Refresh Token từ DB ─────────────────────────────────────────
    @Transactional
    public AuthResponse refreshTokenFromDB(String refreshToken) {
        // 1. Validate chữ ký & hạn dùng của JWT
        if (!jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
            throw new RuntimeException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }

        // 2. Lấy user theo email từ token
        String email = jwtUtil.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));

        // 3. Kiểm tra hash trong DB — bảo vệ chống token bị thu hồi (logout)
        String hashedIncoming = HashUtil.hashSHA256(refreshToken);
        if (user.getTokens() == null || !user.getTokens().equals(hashedIncoming)) {
            throw new RuntimeException("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        }

        // 4. Token Rotation — sinh cặp token mới, lưu hash mới vào DB
        String newAccessToken  = jwtUtil.generateToken(user);
        String newRefreshToken = jwtUtil.generateRefreshToken(user);
        user.setTokens(HashUtil.hashSHA256(newRefreshToken));
        userRepository.save(user);

        LogUtil.info("Refresh token rotated for user '" + user.getUsername() + "'.");
        return new AuthResponse(
                newAccessToken, newRefreshToken,
                user.getId(), user.getUsername(),
                user.getEmail(), user.getRole(),
                user.getFullName(), null
        );
    }

    // ─── Quên Mật Khẩu (Forgot Password) ────────────────────────────
    @Transactional
    public void processForgotPassword(String email, String origin, com.pizza.restaurant.restaurant_backend.service.EmailService emailService) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống."));
        
        // Sinh Token Reset (thời hạn ngắn, VD: 15 phút)
        String resetToken = jwtUtil.generateResetToken(user);
        
        // Gọi EmailService gửi link
        try {
            emailService.sendResetPasswordMail(user.getEmail(), user.getUsername(), resetToken, origin);
            LogUtil.info("Gửi email khôi phục mật khẩu tới: " + email);
        } catch (Exception e) {
            LogUtil.error("Lỗi khi gửi email: " + e.getMessage());
            throw new RuntimeException("Lỗi hệ thống khi gửi email.");
        }
    }

    // ─── Đặt lại Mật Khẩu (Reset Password) ──────────────────────────
    @Transactional
    public void processResetPassword(String token, String newPassword) {
        if (!jwtUtil.validateToken(token) || !jwtUtil.isResetToken(token)) {
            throw new RuntimeException("Link khôi phục đã hết hạn hoặc không hợp lệ.");
        }

        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không hợp lệ."));

        // Encode và cập nhật
        user.setPassword(encodePassword(newPassword));
        userRepository.save(user);
        
        LogUtil.info("Người dùng " + email + " đã đặt lại mật khẩu thành công.");
    }
}
