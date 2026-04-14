package com.pizza.restaurant.restaurant_backend.config;

import com.pizza.restaurant.restaurant_backend.model.User;
import com.pizza.restaurant.restaurant_backend.model.Category;
import com.pizza.restaurant.restaurant_backend.model.Variant;
import com.pizza.restaurant.restaurant_backend.repository.UserRepository;
import com.pizza.restaurant.restaurant_backend.repository.CategoryRepository;
import com.pizza.restaurant.restaurant_backend.repository.VariantRepository;
import com.pizza.restaurant.restaurant_backend.service.AuthService;
import com.pizza.restaurant.restaurant_backend.utils.LogUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final VariantRepository variantRepository;

    @Value("${DEFAULT_ADMIN_EMAIL:admin@pizza.com}")
    private String adminEmail;

    @Value("${DEFAULT_ADMIN_PHONE:0909090909}")
    private String adminPhone;

    @Value("${DEFAULT_ADMIN_PASSWORD:admin}")
    private String adminPassword;

    public DataInitializer(UserRepository userRepository, CategoryRepository categoryRepository, VariantRepository variantRepository) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.variantRepository = variantRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        Optional<User> adminOpt = userRepository.findByUsername("Super Admin");
        
        if (adminOpt.isEmpty()) {
            User admin = new User();
            // Default "username" as the email prefix or fixed name
            admin.setUsername("Super Admin");
            admin.setEmail(adminEmail);
            admin.setPhone(adminPhone);
            admin.setPassword(AuthService.encodePassword(adminPassword));
            admin.setRole("admin");
            
            userRepository.save(admin);
            LogUtil.info("Tài khoản Admin mặc định đã được khởi tạo: " + adminPhone + " / " + adminEmail);
        } else {
            LogUtil.info("Đã có tài khoản Admin trong hệ thống, bỏ qua khởi tạo.");
        }

        // Khởi tạo Variants
        if (variantRepository.count() == 0) {
            String[] sizes = {"S", "M", "L"};
            for (String s : sizes) {
                Variant v = new Variant();
                v.setSize(s);
                variantRepository.save(v);
            }
            LogUtil.info("Đã khởi tạo dữ liệu Variant.");
        }

        // Khởi tạo Categories
        if (categoryRepository.count() == 0) {
            String[][] cats = {
                {"pizza", "Pizza", "pizza.jpg"},
                {"ga-ngon-vibe", "Gà Ngon Vibe", "combo.jpg"},
                {"mi-y", "Mì Ý", "mi-y.jpg"},
                {"nui-bo-lo", "Nui Bỏ Lò", "nui.jpg"},
                {"khai-vi", "Khai Vị", "khai-vi.jpg"},
                {"salad", "Salad", "salad.jpg"},
                {"thuc-uong", "Thức Uống", "drink.webp"}
            };
            for (String[] c : cats) {
                Category cat = new Category();
                cat.setSlug(c[0]);
                cat.setName(c[1]);
                cat.setImageKey(c[2]);
                categoryRepository.save(cat);
            }
            LogUtil.info("Đã khởi tạo dữ liệu Category.");
        }
    }
}
