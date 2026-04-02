import { useState, useEffect } from "react";
import axios from "axios";
import "../style/promotion.css"

export default function Promotions() {
  const [showModal, setShowModal] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [newPromo, setNewPromo] = useState({ code: "", discountPercent: 0, expiryDate: "", status: "Hoạt động" });

  // Load danh sách từ MySQL
  const fetchPromos = () => {
    axios.get("http://localhost:8080/api/promotions")
      .then(res => setPromotions(res.data));
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleSave = async () => {
    await axios.post("http://localhost:8080/api/promotions/add", newPromo);
    setShowModal(false);
    fetchPromos();
    alert("Thêm mã giảm giá thành công!");
  };

  return (
    <div className="promo-wrapper">
      <h2 className="promo-title">Quản lý khuyến mãi</h2>
      <div className="promo-top">
        <input placeholder="Tìm mã giảm giá..." />
        <button onClick={() => setShowModal(true)}>+ Tạo khuyến mãi</button>
      </div>

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
            {promotions.map(p => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td>{p.discountPercent}%</td>
                <td>{p.expiryDate}</td>
                <td><span className={`promo-status ${p.status === 'Hoạt động' ? 'active' : 'exp'}`}>{p.status}</span></td>
                <td>
                  <button className="edit">Sửa</button>
                  <button className="delete" onClick={() => axios.delete(`http://localhost:8080/api/promotions/${p.id}`).then(fetchPromos)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="promo-overlay" onClick={() => setShowModal(false)}>
          <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Tạo khuyến mãi</h3>
            <label>Mã giảm giá</label>
            <input onChange={e => setNewPromo({...newPromo, code: e.target.value})} placeholder="VD: PIZZA10" />
            <label>Phần trăm giảm</label>
            <input type="number" onChange={e => setNewPromo({...newPromo, discountPercent: e.target.value})} placeholder="10" />
            <label>Ngày hết hạn</label>
            <input type="date" onChange={e => setNewPromo({...newPromo, expiryDate: e.target.value})} />
            <div className="promo-actions">
              <button className="cancel" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="save" onClick={handleSave}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}