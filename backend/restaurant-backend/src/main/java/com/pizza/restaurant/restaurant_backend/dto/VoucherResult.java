package com.pizza.restaurant.restaurant_backend.dto;

import com.pizza.restaurant.restaurant_backend.model.Promotion;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Kết quả sau khi validate voucher thành công.
 * Chứa thông tin promotion và số tiền được giảm đã tính toán.
 */
@Data
@AllArgsConstructor
public class VoucherResult {
    private Promotion promotion;
    private BigDecimal discount; // Số tiền được giảm (đã tính và cap)
}
