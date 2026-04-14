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
    
    public Product save(Product product) { 
        if (product.getSlug() == null || product.getSlug().isEmpty()) {
            String baseSlug = product.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
            if (product.getVariant() != null) {
                baseSlug += "-" + product.getVariant().getId();
            }
            product.setSlug(baseSlug + "-" + System.currentTimeMillis());
        }
        return productRepository.save(product); 
    }
    
    public void delete(Long id) { productRepository.deleteById(id); }
    
    public List<Product> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategorySlug(category);
    }

    public Product findById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product update(Long id, Product newProduct) {
        return productRepository.findById(id).map(prod -> {
            prod.setName(newProduct.getName());
            prod.setCategory(newProduct.getCategory());
            prod.setVariant(newProduct.getVariant());
            prod.setPrice(newProduct.getPrice());
            prod.setDescription(newProduct.getDescription());
            // Giữ lại slug nếu có
            if (newProduct.getSlug() != null && !newProduct.getSlug().isEmpty()) {
                prod.setSlug(newProduct.getSlug());
            }
            // Cập nhật ảnh: ưu tiên ảnh mới — nếu không có thì giữ ảnh cũ
            if (newProduct.getImageUrl() != null && !newProduct.getImageUrl().isEmpty()) {
                prod.setImageUrl(newProduct.getImageUrl());
            }
            return productRepository.save(prod);
        }).orElse(null);
    }
}
