package com.pizza.restaurant.restaurant_backend.controller.admin;

import com.pizza.restaurant.restaurant_backend.api.admin.AdminTransactionApi;
import com.pizza.restaurant.restaurant_backend.dto.TransactionDTO;
import com.pizza.restaurant.restaurant_backend.model.Transaction;
import com.pizza.restaurant.restaurant_backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class AdminTransactionController implements AdminTransactionApi {

    @Autowired
    private TransactionRepository transactionRepository;

    private TransactionDTO toDTO(Transaction tx) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(tx.getId());
        dto.setTransactionCode(tx.getTransactionCode());
        dto.setCreatedAt(tx.getCreatedAt());

        if (tx.getOrder() != null) {
            dto.setOrderId(tx.getOrder().getId());
            dto.setOrderTotal(tx.getOrder().getTotalPrice());
            dto.setOrderStatus(tx.getOrder().getStatus());
            dto.setRecipientName(tx.getOrder().getRecipientName());

            if (tx.getOrder().getPayment() != null) {
                dto.setPaymentMethod(tx.getOrder().getPayment().getPaymentMethod());
            }
        }
        return dto;
    }

    @Override
    public ResponseEntity<List<TransactionDTO>> getAllTransactions(Long orderId) {
        List<Transaction> transactions;
        if (orderId != null) {
            transactions = transactionRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
        } else {
            transactions = transactionRepository.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(
                transactions.stream().map(this::toDTO).collect(Collectors.toList())
        );
    }

    @Override
    public ResponseEntity<TransactionDTO> getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .map(tx -> ResponseEntity.ok(toDTO(tx)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
