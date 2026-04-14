-- V4__Extend_Order_Status.sql
-- Thêm trạng thái chế biến cho đơn hàng

ALTER TABLE orders MODIFY status 
  ENUM('pending', 'preparing', 'ready', 'complete', 'cancel') 
  NOT NULL DEFAULT 'pending';

-- Giải thích:
-- pending   → Đơn mới, chờ admin xử lý
-- preparing → Đang chế biến (admin bấm)
-- ready     → Đã xong, sẵn sàng giao/lấy (admin bấm)
-- complete  → Hoàn thành toàn bộ
-- cancel    → Đã huỷ
