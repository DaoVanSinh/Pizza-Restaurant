package com.pizza.restaurant.restaurant_backend.controller;

import com.pizza.restaurant.restaurant_backend.model.Product;
import com.pizza.restaurant.restaurant_backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    // 1. API Lấy tất cả hoặc lọc theo loại (Dùng cho các tab Pizza, Mì Ý...)
    @GetMapping
    public List<Product> getProducts(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return productService.getByCategory(category);
        }
        return productService.getAll();
    }

    // 2. API Thêm sản phẩm
    @PostMapping("/add")
    public Product addProduct(@RequestBody Product product) {
        // Backend sẽ nhận toàn bộ object từ Frontend
        // product.getCategory()
        return productService.save(product);
    }

    // 3. API Tìm kiếm theo tên (Yêu cầu ban đầu của bạn)
    @GetMapping("/search")
    public List<Product> search(@RequestParam String name) {
        return productService.searchByName(name);
    }
}

