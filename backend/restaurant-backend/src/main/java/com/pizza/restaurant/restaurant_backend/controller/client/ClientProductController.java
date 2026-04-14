package com.pizza.restaurant.restaurant_backend.controller.client;

import com.pizza.restaurant.restaurant_backend.api.client.ClientProductApi;
import com.pizza.restaurant.restaurant_backend.model.Product;
import com.pizza.restaurant.restaurant_backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController

public class ClientProductController implements ClientProductApi {

    @Autowired
    private ProductService productService;

    @Override
    public ResponseEntity<List<Product>> getProducts(String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(productService.getProductsByCategory(category));
        }
        return ResponseEntity.ok(productService.getAll());
    }

    @Override
    public ResponseEntity<List<Product>> searchProducts(String name) {
        return ResponseEntity.ok(productService.searchByName(name));
    }

    @Override
    public ResponseEntity<Product> getProductById(Long id) {
        Product product = productService.findById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }
}

