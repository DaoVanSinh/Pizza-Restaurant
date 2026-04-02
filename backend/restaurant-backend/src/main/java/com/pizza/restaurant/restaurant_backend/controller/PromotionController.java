package com.pizza.restaurant.restaurant_backend.controller;

import com.pizza.restaurant.restaurant_backend.model.Promotion;
import com.pizza.restaurant.restaurant_backend.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {
    @Autowired
    private PromotionRepository promotionRepository;

    @GetMapping
    public List<Promotion> getAll() {
        return promotionRepository.findAll();
    }

    @PostMapping("/add")
    public Promotion create(@RequestBody Promotion promo) {
        return promotionRepository.save(promo); // Lưu vào MySQL
    }

    @GetMapping("/search")
    public List<Promotion> search(@RequestParam(required = false) String code,
                                    @RequestParam(required = false) String status) {
        return promotionRepository.findByCodeContainingIgnoreCaseOrStatus(code, status);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        promotionRepository.deleteById(id);
    }
}
