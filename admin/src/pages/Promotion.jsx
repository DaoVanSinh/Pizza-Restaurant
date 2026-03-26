import { useState } from "react";
import "../style/promotion.css"


export default function Promotions() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="promo-wrapper">
      <h2 className="promo-title">Quản lý khuyến mãi</h2>

      {/* TOP BAR */}
      <div className="promo-top">
        <input placeholder="Tìm mã giảm giá..." />
        <button onClick={() => setShowModal(true)}>
          + Tạo khuyến mãi
        </button>
      </div>

      {/* TABLE */}
      <div className="promo-box">
        <table className="promo-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Giảm (%)</th>
              <th>Hạn</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>PIZZA10</td>
              <td>10%</td>
              <td>30/03/2026</td>
              <td><span className="promo-status active">Hoạt động</span></td>
              <td>
                <button className="edit">Sửa</button>
                <button className="delete">Xóa</button>
              </td>
            </tr>

            <tr>
              <td>SALE20</td>
              <td>20%</td>
              <td>01/04/2026</td>
              <td><span className="promo-status exp">Sắp hết</span></td>
              <td>
                <button className="edit">Sửa</button>
                <button className="delete">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="promo-overlay" onClick={() => setShowModal(false)}>
          <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Tạo khuyến mãi</h3>

            <label>Mã giảm giá</label>
            <input placeholder="VD: PIZZA10" />

            <label>Phần trăm giảm</label>
            <input type="number" placeholder="10" />

            <label>Ngày hết hạn</label>
            <input type="date" />

            <div className="promo-actions">
              <button className="cancel" onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button className="save">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}