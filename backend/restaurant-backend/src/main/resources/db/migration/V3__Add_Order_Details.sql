-- V3__Add_Order_Details.sql
-- Thêm các trường cần thiết để phục vụ Giao hàng/Đến lấy cho chức năng Order

ALTER TABLE orders
  ADD COLUMN order_type ENUM('DELIVERY', 'PICKUP') NOT NULL DEFAULT 'DELIVERY' AFTER address,
  ADD COLUMN recipient_name VARCHAR(255) NULL AFTER order_type,
  ADD COLUMN recipient_phone VARCHAR(20) NULL AFTER recipient_name,
  ADD COLUMN note VARCHAR(500) NULL AFTER recipient_phone,
  ADD COLUMN shipping_fee DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER note,
  ADD COLUMN discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER shipping_fee;

-- Make address nullable because PICKUP orders don't require an address
ALTER TABLE orders MODIFY address VARCHAR(500) NULL;

-- Thêm các trường phụ của Order Item
ALTER TABLE order_items
  ADD COLUMN selected_size ENUM('S', 'M', 'L') NULL AFTER amount,
  ADD COLUMN note VARCHAR(255) NULL AFTER selected_size,
  ADD COLUMN price DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER note;
