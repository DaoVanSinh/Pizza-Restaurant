import { useState } from "react";
import "../style/account.css";
import { useNavigate } from "react-router-dom";


export default function Account() {
  const [showChange, setShowChange] = useState(false);

const navigate = useNavigate();


  return (
    <div className="account" onClick={() => navigate("/moreAccount")}>
      <h2>Tài khoản</h2>

      {/* INFO */}
      <div className="card">
        <div className="profile">
          <div className="avatar"></div>

          <div>
            <h3>Admin</h3>
            <p>admin@gmail.com</p>
            <span className="role">Quản trị viên</span>
          </div>
        </div>

        <button className="btn" onClick={() => setShowChange(true)}>
          Đổi mật khẩu
        </button>
      </div>

      {/* MODAL */}
      {showChange && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Đổi mật khẩu</h3>

            <label>Mật khẩu hiện tại</label>
            <input type="password" />

            <label>Mật khẩu mới</label>
            <input type="password" />

            <label>Xác nhận mật khẩu</label>
            <input type="password" />

            <div className="actions">
              <button className="cancel" onClick={() => setShowChange(false)}>
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