import { useState, useEffect } from "react";
import axios from "axios";
import "../style/account.css";

export default function AccountProfile() {
  const [user, setUser] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: ""
  });
  
  useEffect(() => {
    axios.get("http://localhost:8080/api/users/1") 
      .then(res => setUser(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.post("http://localhost:8080/api/users/register", user);
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      alert("Lỗi cập nhật!");
    }
  };

  return (
    <div className="accx-wrapper">
      <div className="accx-title">
        <h2>Tài khoản</h2>
      </div>
      <div className="accx-layout">
        <div className="accx-card">
          <h3>Thông tin cá nhân</h3>
          <div className="accx-row">
            <label>Họ tên</label>
            <input name="fullName" value={user.fullName} onChange={handleChange} />
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

        <div className="accx-card">
          <h3>Bảo mật</h3>
          <div className="accx-row">
            <label>Mật khẩu hiện tại</label>
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
      <div className="accx-actions">
        <button className="accx-save" onClick={handleSave}>Lưu thay đổi</button>
      </div>
    </div>
  );
}