package com.pizza.restaurant.restaurant_backend.repository;
import com.pizza.restaurant.restaurant_backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // Tìm kiếm sản phẩm theo tên
    List<Product> findByNameContainingIgnoreCase(String name);
    
    // Lọc sản phẩm theo loại (slug)
    List<Product> findByCategorySlug(String slug);
}
