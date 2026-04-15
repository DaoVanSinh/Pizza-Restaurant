-- V6: Cập nhật cột role từ ENUM sang VARCHAR để hỗ trợ role 'staff'
-- Cột full_name đã được thêm thủ công trước đó

ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';

