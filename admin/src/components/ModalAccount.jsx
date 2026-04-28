import { FaUserCircle, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/modules/auth.api";

export default function ModalAccount() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

  const handleLogout = async () => {
    try {
      // Gọi backend để xóa refreshToken khỏi DB
      await authApi.logout();
    } catch {
      // Dù server có lỗi vẫn xóa local storage
    }
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
    navigate("/login");
  };

  return (
    <div className="dropdown">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-bold text-slate-900 truncate">{userInfo.fullName || userInfo.username || "Admin"}</p>
        <p className="text-xs text-slate-500 truncate">{userInfo.email || "admin@pizza.com"}</p>
      </div>

      <Link to="/account" className="dropdown-item">
        <FaUserCircle className="icon" />
        <span>Hồ sơ của tôi</span>
      </Link>

      <div className="dropdown-item logout" onClick={handleLogout}>
        <FaSignOutAlt className="icon" />
        <span>Đăng xuất</span>
      </div>
        <hr className="border-slate-100"></hr>
      <div className="dropdown-item">
        <FaShieldAlt className="icon text-slate-400" />
        <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Privacy Policy</span>
      </div>
    </div>
  );
}