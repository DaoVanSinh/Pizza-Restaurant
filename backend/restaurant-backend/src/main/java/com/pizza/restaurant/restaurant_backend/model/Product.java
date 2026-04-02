package com.pizza.restaurant.restaurant_backend.model;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "products")
@Data // Lombok annotation to generate getters, setters, and other utility methods
public class Product {
    @Id // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment strategy
    private Long id;

    private String name;
    private String category; // Pizza, Drink, Pasta, ...
    private Double price;
    private String description;
    private String imageUrl; // URL to the product image
    private Boolean available; // true: đang bán, false: ngừng bán
}
