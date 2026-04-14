-- V5: Thêm cột cancel_reason vào bảng orders để lưu lý do hủy đơn của admin
ALTER TABLE orders ADD COLUMN cancel_reason VARCHAR(500) NULL AFTER note;
