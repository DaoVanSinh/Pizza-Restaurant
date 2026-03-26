import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ModalAccount() {
  return (
    <div className="dropdown">
      <Link to="/account" className="dropdown-item">
        <FaUserCircle className="icon" />
        <span>Tài khoản</span>
      </Link>

      <div className="dropdown-item logout">
        <FaSignOutAlt className="icon" />
        <span>Đăng xuất</span>
      </div>
        <hr></hr>
      <div className="dropdown-item">
      <span>Điều khoản dịch vụ</span>
      </div>
      <div className="dropdown-item">
      <span>Chính sách bảo mật</span>
      </div>
    </div>
  );
}