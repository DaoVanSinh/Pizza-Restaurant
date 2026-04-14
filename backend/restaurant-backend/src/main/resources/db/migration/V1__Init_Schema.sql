-- 1. USER
CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    tokens      TEXT,
    phone       VARCHAR(20),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL DEFAULT NULL
);

-- 2. PROFILE
CREATE TABLE profiles (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE,
    avatar      VARCHAR(500) NULL,
    address     VARCHAR(500) NULL,
    full_name   VARCHAR(255) NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. CATEGORY
CREATE TABLE categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    image_key   VARCHAR(255) NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL DEFAULT NULL
);

-- 4. VARIANT
CREATE TABLE variants (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    size        ENUM('S', 'M', 'L') NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL DEFAULT NULL
);

-- 5. PRODUCT
CREATE TABLE products (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL,
    variant_id  BIGINT NOT NULL,
    price       DECIMAL(15,2) NOT NULL DEFAULT 0,
    image_url   VARCHAR(500) NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (variant_id)  REFERENCES variants(id)
);

-- 6. CART
CREATE TABLE carts (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 7. CART ITEM
CREATE TABLE cart_items (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id     BIGINT NOT NULL,
    product_id  BIGINT NOT NULL,
    amount      INT NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (cart_id)    REFERENCES carts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 8. PAYMENT
CREATE TABLE payments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    status          ENUM('pending', 'success', 'cancel') NOT NULL DEFAULT 'pending',
    payment_method  ENUM('cod', 'vnpay') NOT NULL DEFAULT 'cod',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL DEFAULT NULL
);

-- 9. ORDER
CREATE TABLE orders (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    address     VARCHAR(500) NOT NULL,
    status      ENUM('pending', 'complete', 'cancel') NOT NULL DEFAULT 'pending',
    total_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_id  BIGINT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id)    REFERENCES users(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- 10. ORDER ITEM
CREATE TABLE order_items (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id    BIGINT NOT NULL,
    product_id  BIGINT NOT NULL,
    amount      INT NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 11. TRANSACTION
CREATE TABLE transactions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id            BIGINT NOT NULL,
    transaction_code    VARCHAR(255) NOT NULL UNIQUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
