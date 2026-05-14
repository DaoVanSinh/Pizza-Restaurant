package com.pizza.restaurant.restaurant_backend.service;

import com.pizza.restaurant.restaurant_backend.dto.VoucherResult;
import com.pizza.restaurant.restaurant_backend.model.Order;
import com.pizza.restaurant.restaurant_backend.model.Promotion;
import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.model.VoucherUsage;
import com.pizza.restaurant.restaurant_backend.repository.PromotionRepository;
import com.pizza.restaurant.restaurant_backend.repository.VoucherUsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private VoucherUsageRepository voucherUsageRepository;

    // ========================
    // ADMIN: CRUD Operations
    // ========================

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    /**
     * Admin tạo voucher mới với validation đầy đủ
     */
    public Promotion createPromotion(Promotion promotion) {
        // Validate code
        if (promotion.getCode() == null || promotion.getCode().trim().isEmpty()) {
            throw new RuntimeException("Mã voucher không được rỗng");
        }
        promotion.setCode(promotion.getCode().trim().toUpperCase());

        Optional<Promotion> existing = promotionRepository.findByCode(promotion.getCode());
        if (existing.isPresent()) {
            throw new RuntimeException("Mã voucher đã tồn tại");
        }

        // Validate discountType
        if (promotion.getDiscountType() == null ||
                (!"PERCENT".equals(promotion.getDiscountType()) && !"FIXED".equals(promotion.getDiscountType()))) {
            throw new RuntimeException("Loại giảm giá phải là PERCENT hoặc FIXED");
        }

        // Validate discountValue
        if (promotion.getDiscountValue() == null || promotion.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Giá trị giảm phải lớn hơn 0");
        }
        if ("PERCENT".equals(promotion.getDiscountType()) &&
                promotion.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("Phần trăm giảm không được vượt quá 100%");
        }

        // Validate minOrderValue (BẮT BUỘC)
        if (promotion.getMinOrderValue() == null || promotion.getMinOrderValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Giá trị đơn tối thiểu không hợp lệ");
        }

        // Validate dates
        if (promotion.getStartDate() == null || promotion.getEndDate() == null) {
            throw new RuntimeException("Ngày bắt đầu và ngày hết hạn là bắt buộc");
        }
        if (!promotion.getEndDate().after(promotion.getStartDate())) {
            throw new RuntimeException("Ngày hết hạn phải lớn hơn ngày bắt đầu");
        }

        // Validate limitPerUser
        if (promotion.getLimitPerUser() == null || promotion.getLimitPerUser() < 1) {
            promotion.setLimitPerUser(1);
        }

        // Validate maxDiscountAmount (chỉ có ý nghĩa cho PERCENT)
        if ("FIXED".equals(promotion.getDiscountType())) {
            promotion.setMaxDiscountAmount(null); // không cần cap cho loại cố định
        }

        // Default values
        promotion.setUsageCount(0);
        if (promotion.getStatus() == null) {
            promotion.setStatus("DRAFT");
        }

        return promotionRepository.save(promotion);
    }

    /**
     * Admin cập nhật trạng thái voucher (DRAFT→ACTIVE, ACTIVE→PAUSED, PAUSED→ACTIVE)
     */
    public Promotion updateStatus(Long id, String newStatus) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));

        String current = promotion.getStatus();

        // Validate transition
        boolean valid = false;
        if ("DRAFT".equals(current) && "ACTIVE".equals(newStatus)) valid = true;
        if ("ACTIVE".equals(current) && "PAUSED".equals(newStatus)) valid = true;
        if ("PAUSED".equals(current) && "ACTIVE".equals(newStatus)) valid = true;
        if ("ACTIVE".equals(current) && "EXPIRED".equals(newStatus)) valid = true;

        if (!valid) {
            throw new RuntimeException("Không thể chuyển trạng thái từ " + current + " sang " + newStatus);
        }

        promotion.setStatus(newStatus);
        return promotionRepository.save(promotion);
    }

    public void deletePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));

        if ("ACTIVE".equals(promotion.getStatus())) {
            throw new RuntimeException("Không thể xóa voucher đang hoạt động. Hãy tạm dừng trước.");
        }

        promotionRepository.deleteById(id);
    }

    // ========================
    // CLIENT: Validate & Apply
    // ========================

    /**
     * Fail-fast validation 5 bước cho voucher.
     * Trả về VoucherResult chứa Promotion + số tiền giảm đã tính.
     *
     * @param code       Mã voucher khách nhập
     * @param userId     ID của user đang đặt đơn
     * @param orderTotal Tổng tiền hàng (chưa tính shipping, chưa giảm)
     * @return VoucherResult
     */
    public VoucherResult validateAndCalculate(String code, Long userId, BigDecimal orderTotal) {
        // Bước 1: Kiểm tra tồn tại + Status = ACTIVE
        Promotion p = promotionRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã không hợp lệ"));

        if (!"ACTIVE".equals(p.getStatus())) {
            throw new RuntimeException("Mã không khả dụng lúc này");
        }

        // Bước 2: Kiểm tra hạn sử dụng (startDate <= now <= endDate)
        Timestamp now = Timestamp.from(Instant.now());
        if (now.before(p.getStartDate())) {
            throw new RuntimeException("Mã chưa đến thời gian sử dụng");
        }
        if (now.after(p.getEndDate())) {
            throw new RuntimeException("Mã đã hết hạn");
        }

        // Bước 3: Kiểm tra giá trị đơn hàng tối thiểu
        if (orderTotal.compareTo(p.getMinOrderValue()) < 0) {
            throw new RuntimeException("Đơn hàng cần tối thiểu " +
                    p.getMinOrderValue().setScale(0, RoundingMode.FLOOR).toPlainString() + "đ để áp dụng mã này");
        }

        // Bước 4: Kiểm tra giới hạn sử dụng
        // 4a. Giới hạn tổng
        if (p.getTotalUsageLimit() != null && p.getUsageCount() >= p.getTotalUsageLimit()) {
            throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng");
        }
        // 4b. Giới hạn per-user
        int userUsed = voucherUsageRepository.countByPromotionIdAndUserId(p.getId(), userId);
        if (userUsed >= p.getLimitPerUser()) {
            throw new RuntimeException("Bạn đã hết lượt sử dụng mã này");
        }

        // Bước 5: Tính toán tiền giảm
        BigDecimal discount;
        if ("FIXED".equals(p.getDiscountType())) {
            discount = p.getDiscountValue();
        } else {
            // PERCENT
            discount = orderTotal.multiply(p.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.FLOOR);
            // Cap bởi maxDiscountAmount nếu có
            if (p.getMaxDiscountAmount() != null && discount.compareTo(p.getMaxDiscountAmount()) > 0) {
                discount = p.getMaxDiscountAmount();
            }
        }

        // Đảm bảo không giảm quá tổng đơn (tránh hóa đơn âm)
        if (discount.compareTo(orderTotal) > 0) {
            discount = orderTotal;
        }

        return new VoucherResult(p, discount);
    }

    /**
     * Ghi nhận sử dụng voucher sau khi đặt đơn thành công.
     * Tăng usageCount (Optimistic Lock tự handle race condition).
     */
    @Transactional
    public void applyVoucher(Long promotionId, User user, Order order) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));

        // Tăng usageCount (nếu race condition xảy ra, @Version sẽ throw OptimisticLockException)
        promotion.setUsageCount(promotion.getUsageCount() + 1);
        promotionRepository.save(promotion);

        // Ghi record usage
        VoucherUsage usage = new VoucherUsage();
        usage.setPromotion(promotion);
        usage.setUser(user);
        usage.setOrder(order);
        voucherUsageRepository.save(usage);
    }

    /**
     * Hoàn trả lượt dùng voucher khi thanh toán thất bại / hủy đơn.
     */
    @Transactional
    public void rollbackVoucher(Long orderId) {
        // Tìm tất cả usage records của order này
        // (1 order chỉ có tối đa 1 voucher, nhưng query an toàn)
        List<VoucherUsage> usages = voucherUsageRepository.findAll().stream()
                .filter(u -> u.getOrder().getId().equals(orderId))
                .toList();

        for (VoucherUsage usage : usages) {
            Promotion promotion = usage.getPromotion();
            if (promotion.getUsageCount() > 0) {
                promotion.setUsageCount(promotion.getUsageCount() - 1);
                promotionRepository.save(promotion);
            }
            voucherUsageRepository.delete(usage);
        }
    }

    /**
     * Validate mã cho client preview (KHÔNG tăng usageCount).
     * Dùng ở endpoint GET /client/promotions/check?code=XXX
     */
    public Promotion validateCodeForPreview(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new RuntimeException("Mã không hợp lệ");
        }

        Promotion p = promotionRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã khuyến mãi không tồn tại"));

        if (!"ACTIVE".equals(p.getStatus())) {
            throw new RuntimeException("Mã không khả dụng lúc này");
        }

        Timestamp now = Timestamp.from(Instant.now());
        if (now.before(p.getStartDate())) {
            throw new RuntimeException("Mã chưa đến thời gian sử dụng");
        }
        if (now.after(p.getEndDate())) {
            throw new RuntimeException("Mã đã hết hạn");
        }

        if (p.getTotalUsageLimit() != null && p.getUsageCount() >= p.getTotalUsageLimit()) {
            throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng");
        }

        return p;
    }
}
