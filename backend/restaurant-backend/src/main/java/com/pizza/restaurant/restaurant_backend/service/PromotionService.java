package com.pizza.restaurant.restaurant_backend.service;

import com.pizza.restaurant.restaurant_backend.model.Promotion;
import com.pizza.restaurant.restaurant_backend.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public Promotion createPromotion(Promotion promotion) {
        if (promotion.getCode() == null || promotion.getCode().trim().isEmpty()) {
            throw new RuntimeException("Mã khuyến mãi không được rỗng");
        }
        promotion.setCode(promotion.getCode().trim().toUpperCase());
        
        Optional<Promotion> existing = promotionRepository.findByCode(promotion.getCode());
        if (existing.isPresent()) {
            throw new RuntimeException("Mã khuyến mãi đã tồn tại");
        }
        
        if (promotion.getDiscountPercent() == null || promotion.getDiscountPercent() <= 0 || promotion.getDiscountPercent() > 100) {
            throw new RuntimeException("Phần trăm giảm giá phải nằm trong khoảng từ 1% đến 100%");
        }
        
        if (promotion.getExpiryDate() == null || promotion.getExpiryDate().before(Timestamp.from(Instant.now()))) {
             throw new RuntimeException("Ngày hết hạn không được trong quá khứ");
        }

        return promotionRepository.save(promotion);
    }

    public void deletePromotion(Long id) {
        promotionRepository.deleteById(id);
    }

    /**
     * Check if a voucher code is valid.
     * Returns the Promotion if valid, otherwise throws RuntimeException.
     */
    public Promotion validateCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new RuntimeException("Mã không hợp lệ");
        }
        Promotion promotion = promotionRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã khuyến mãi không tồn tại"));

        if (promotion.getExpiryDate().before(Timestamp.from(Instant.now()))) {
            throw new RuntimeException("Mã khuyến mãi đã hết hạn");
        }

        return promotion;
    }
}
