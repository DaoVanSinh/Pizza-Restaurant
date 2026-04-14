package com.pizza.restaurant.restaurant_backend.controller.admin;

import com.pizza.restaurant.restaurant_backend.model.Variant;
import com.pizza.restaurant.restaurant_backend.repository.VariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/variants")

public class AdminVariantController {

    @Autowired
    private VariantRepository variantRepository;

    @GetMapping
    public ResponseEntity<List<Variant>> getAllVariants() {
        return ResponseEntity.ok(variantRepository.findAll());
    }
}

