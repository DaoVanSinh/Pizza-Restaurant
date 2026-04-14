import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../style/staff.css";
import { userApi } from "../../services/modules/user.api";
import { toast } from "sonner";

export default function AddEmployee() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      phone: "",
      role: "STAFF",
      password: ""
  });

  const handleSubmit = async () => {
      if(!formData.fullName || !formData.phone || !formData.password) {
          toast.warning("Vui lòng nhập tên, SĐT và Mật khẩu!");
          return;
      }
      
      try {
          await userApi.registerUser(formData);
          toast.success("Thêm nhân viên thành công!");
          navigate("/staff");
      } catch(err) {
          toast.error("Lỗi thêm nhân viên (Có thể SĐT đã tồn tại)");
      }
  };

  return (
    <div className="emp-add-wrapper">
      <div className="emp-add-header">
        <Link to="/staff" className="emp-back">&larr;</Link>
        <h2>Thêm nhân viên mới</h2>
      </div>

      <div className="emp-add-form">
        <div className="emp-left">
          <label>Họ và tên</label>
          <input type="text" placeholder="Nguyễn Văn A" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />

          <label>Email</label>
          <input type="email" placeholder="email@gmail.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />

          <label>Số điện thoại</label>
          <input type="text" placeholder="0123456789" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />

          <label>Cấp độ (Role)</label>
          <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="STAFF">Nhân viên (STAFF)</option>
            <option value="ADMIN">Quản lý (ADMIN)</option>
          </select>
        </div>

        <div className="emp-right">
          <label>Mật khẩu đăng nhập</label>
          <input type="password" placeholder="********" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        </div>
      </div>

      <div className="emp-actions">
        <Link to="/staff" className="emp-cancel" style={{textDecoration: 'none', textAlign: 'center'}}>Hủy</Link>
        <button className="emp-save" onClick={handleSubmit}>Lưu nhân viên</button>
      </div>
    </div>
  );
}