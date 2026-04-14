package com.pizza.restaurant.restaurant_backend.repository;

import com.pizza.restaurant.restaurant_backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /** Kiểm tra mã giao dịch đã tồn tại chưa (idempotency) */
    boolean existsByTransactionCode(String transactionCode);

    /** Lấy tất cả giao dịch, mới nhất lên đầu */
    List<Transaction> findAllByOrderByCreatedAtDesc();

    /** Lấy giao dịch theo orderId */
    List<Transaction> findByOrderIdOrderByCreatedAtDesc(Long orderId);
}
