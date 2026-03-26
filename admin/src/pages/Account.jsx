import { useState } from "react";
import "../style/account.css";
import { Link } from "react-router-dom";

export default function AccountProfile() {
  const [user, setUser] = useState({
    name: "Nguyễn Văn A",
    phone: "0123456789",
    email: "admin@gmail.com",
    password: "123456"
  });

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="accx-wrapper">
      <div className="accx-title">
        {/* <Link className="come-back" to="/account">&larr;</Link> */}
        <h2>Tài khoản</h2>
      </div>
      <div className="accx-layout">

        {/* LEFT - PROFILE */}
        <div className="accx-card">
          <h3>Thông tin cá nhân</h3>

          <div className="accx-row">
            <label>Họ tên</label>
            <input name="name" value={user.name} onChange={handleChange} />
          </div>

          <div className="accx-row">
            <label>Số điện thoại</label>
            <input name="phone" value={user.phone} onChange={handleChange} />
          </div>

          <div className="accx-row">
            <label>Email</label>
            <input name="email" value={user.email} onChange={handleChange} />
          </div>
        </div>

        {/* RIGHT - PASSWORD */}
        <div className="accx-card">
          <h3>Bảo mật</h3>

          <div className="accx-row">
            <label>Mật khẩu</label>
            <input type="password" value={user.password} readOnly />
          </div>

          <div className="accx-row">
            <label>Mật khẩu mới</label>
            <input type="password" placeholder="Nhập mật khẩu mới..." />
          </div>

          <div className="accx-row">
            <label>Xác nhận</label>
            <input type="password" placeholder="Nhập lại mật khẩu..." />
          </div>
        </div>
      </div>

      {/* ACTION */}
      <div className="accx-actions">
        <button className="accx-save">Lưu thay đổi</button>
      </div>
    </div>
  );
}