package com.pizza.restaurant.restaurant_backend.api.admin;

import com.pizza.restaurant.restaurant_backend.dto.TransactionDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/v1/admin/transactions")
@Tag(name = "Admin Transactions", description = "Quản lý giao dịch thanh toán")
public interface AdminTransactionApi {

    @Operation(summary = "Lấy toàn bộ giao dịch (mới nhất lên đầu)")
    @GetMapping
    ResponseEntity<List<TransactionDTO>> getAllTransactions(
            @RequestParam(required = false) Long orderId
    );

    @Operation(summary = "Xem chi tiết một giao dịch")
    @GetMapping("/{id}")
    ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Long id);
}
