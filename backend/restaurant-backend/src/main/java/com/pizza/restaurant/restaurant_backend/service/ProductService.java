package com.pizza.restaurant.restaurant_backend.service;

import com.pizza.restaurant.restaurant_backend.model.Product;
import com.pizza.restaurant.restaurant_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAll() { return productRepository.findAll(); }
    
    public Product save(Product product) { return productRepository.save(product); }
    
    public void delete(Long id) { productRepository.deleteById(id); }
    
    public List<Product> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }
    public List<Product> getByCategory(String category) {
        return productRepository.findByCategory(category);
    }
}
