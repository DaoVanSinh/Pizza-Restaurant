import { Link } from "react-router-dom";
import "../../style/staff.css";

export default function AddEmployee() {
  return (
    <div className="emp-add-wrapper">

      {/* HEADER */}
      <div className="emp-add-header">
        <Link to="/staff" className="emp-back">
          &larr;
        </Link>
        <h2>Thêm nhân viên</h2>
      </div>

      {/* FORM */}
      <div className="emp-add-form">

        {/* LEFT */}
        <div className="emp-left">
          <label>Họ và tên</label>
          <input type="text" placeholder="Nguyễn Văn A" />

          <label>Email</label>
          <input type="email" placeholder="email@gmail.com" />

          <label>Số điện thoại</label>
          <input type="text" placeholder="0123456789" />

          <label>Chức vụ</label>
          <select>
            <option>Nhân viên</option>
            <option>Quản lý</option>
          </select>
        </div>

        {/* RIGHT */}
        <div className="emp-right">
          <label>Ảnh đại diện</label>
          <div className="emp-upload">
            <p>+ Tải ảnh</p>
          </div>

          <label>Trạng thái</label>
          <div className="emp-status">
            <input type="checkbox" defaultChecked />
            <span>Đang làm việc</span>
          </div>

          <label>Mật khẩu</label>
          <input type="password" placeholder="********" />
        </div>
      </div>

      {/* ACTION */}
      <div className="emp-actions">
        <button className="emp-cancel">Hủy</button>
        <button className="emp-save">Thêm nhân viên</button>
      </div>

    </div>
  );
}