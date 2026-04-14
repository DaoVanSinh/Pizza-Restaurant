package com.pizza.restaurant.restaurant_backend.api.client;

import com.pizza.restaurant.restaurant_backend.model.Product;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RequestMapping("/api/v1/client/products")
@Tag(name = "Client Products", description = "Các endpoint xem sản phẩm dành cho Khách (Public)")
public interface ClientProductApi {

    @Operation(summary = "Lấy danh sách sản phẩm (có lọc theo category)")
    @GetMapping
    ResponseEntity<List<Product>> getProducts(@RequestParam(required = false) String category);

    @Operation(summary = "Tìm kiếm sản phẩm theo tên")
    @GetMapping("/search")
    ResponseEntity<List<Product>> searchProducts(@RequestParam String name);

    @Operation(summary = "Lấy chi tiết 1 sản phẩm")
    @GetMapping("/{id}")
    ResponseEntity<Product> getProductById(@PathVariable Long id);
}
