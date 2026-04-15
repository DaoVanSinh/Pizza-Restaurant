import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../style/staff.css";
import { userApi } from "../../services/modules/user.api";
import { toast } from "sonner";

export default function AddEmployee() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    role: "staff",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.fullName || !formData.email || !formData.password) {
      toast.warning("Vui lòng điền đầy đủ: Tên đăng nhập, Họ tên, Email và Mật khẩu!");
      return;
    }
    if (formData.password.length < 6) {
      toast.warning("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    setLoading(true);
    const roleLabel = formData.role === "admin" ? "quản lý" : "nhân viên";
    try {
      await userApi.registerUser(formData);
      toast.success(`✅ Tạo tài khoản ${roleLabel} "${formData.fullName}" thành công!`);
      navigate("/staff");
    } catch (err) {
      const msg = err?.response?.data || "Lỗi tạo tài khoản (email/SĐT/username đã tồn tại)";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isManager = formData.role === "admin";

  return (
    <div className="emp-add-wrapper">
      <div className="emp-add-header">
        <Link to="/staff" className="emp-back">&larr;</Link>
        <h2>{isManager ? "👑 Thêm Quản lý mới" : "👤 Thêm Nhân viên mới"}</h2>
      </div>

      <div className="emp-add-form">
        {/* CỘT TRÁI */}
        <div className="emp-left">
          <label>Họ và tên <span style={{ color: "#e53935" }}>*</span></label>
          <input
            type="text"
            name="fullName"
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChange={handleChange}
          />

          <label>Tên đăng nhập <span style={{ color: "#e53935" }}>*</span></label>
          <input
            type="text"
            name="username"
            placeholder="nhanvien01"
            value={formData.username}
            onChange={handleChange}
          />

          <label>Email <span style={{ color: "#e53935" }}>*</span></label>
          <input
            type="email"
            name="email"
            placeholder="email@gmail.com"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Số điện thoại</label>
          <input
            type="text"
            name="phone"
            placeholder="0123456789"
            value={formData.phone}
            onChange={handleChange}
          />

          <label>Cấp độ (Vai trò) <span style={{ color: "#e53935" }}>*</span></label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="staff">Nhân viên (STAFF)</option>
            <option value="admin">Quản lý (ADMIN)</option>
          </select>
        </div>

        {/* CỘT PHẢI */}
        <div className="emp-right">
          <label>Mật khẩu đăng nhập <span style={{ color: "#e53935" }}>*</span></label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Tối thiểu 6 ký tự"
              value={formData.password}
              onChange={handleChange}
              style={{ width: "100%", paddingRight: "80px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: "10px", top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", color: "#888", cursor: "pointer", fontSize: "12px"
              }}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          {/* Hướng dẫn */}
          <div style={{
            marginTop: "20px",
            background: isManager ? "#f3e5f5" : "#fff8e1",
            border: `1px solid ${isManager ? "#ce93d8" : "#ffe082"}`,
            borderRadius: "8px",
            padding: "14px",
            fontSize: "13px",
            color: isManager ? "#4a148c" : "#795548",
            lineHeight: "1.6"
          }}>
            <strong>{isManager ? "👑 Lưu ý — Quản lý (ADMIN):" : "💡 Lưu ý — Nhân viên (STAFF):"}</strong>
            {isManager ? (
              <ul style={{ marginTop: "8px", paddingLeft: "16px" }}>
                <li>Quản lý có <strong>toàn quyền</strong> như Admin: quản lý sản phẩm, đơn hàng, báo cáo</li>
                <li>Có thể tạo tài khoản nhân viên khác</li>
                <li>Đăng nhập bằng <strong>Email / SĐT / Tên đăng nhập</strong></li>
              </ul>
            ) : (
              <ul style={{ marginTop: "8px", paddingLeft: "16px" }}>
                <li>Nhân viên đăng nhập bằng <strong>Email / SĐT / Tên đăng nhập</strong></li>
                <li>Mật khẩu được admin tạo sẵn, nhân viên có thể đổi sau khi đăng nhập</li>
                <li>Nhân viên chỉ xem được: Trang chủ, Đơn hàng, Giao dịch, POS</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="emp-actions">
        <Link to="/staff" className="emp-cancel" style={{ textDecoration: "none", textAlign: "center" }}>Hủy</Link>
        <button className="emp-save" onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang lưu..." : isManager ? "👑 Tạo tài khoản Quản lý" : "👤 Tạo tài khoản Nhân viên"}
        </button>
      </div>
    </div>
  );
}