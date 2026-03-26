import { FaPizzaSlice, FaUtensils, FaBars, FaSearch, FaHome,FaUsers, FaUser, FaBoxOpen, FaCashRegister } from "react-icons/fa";
import { BiSolidOffer } from "react-icons/bi";
import userIcon from "../assets/userIcon.png";
import { NavLink, Outlet } from "react-router-dom";


export default function AdminLayout() {
  const menu = [
  { icon: <FaHome />, label: "Trang chủ", path: "/" },
  { icon: <BiSolidOffer />, label: "Khuyến mãi", path: "/promotion" },
  { icon: <FaBoxOpen />, label: "Sản phẩm", path: "/products" },
  { icon: <FaBars />, label: "Báo cáo", path: "/dashboard" },
  { icon: <FaUsers />, label: "Nhân viên", path: "/staff" },
  { icon: <FaUser />, label: "Tài khoản", path: "/account" },
  { icon: <FaCashRegister/>, label: "POS", path: "/pos" },
];
  return (
    <div className="admin-container">     
      <div className="sidebar">
          {menu.map((item) => (
          <div className="item-sidebar" key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              {item.icon} {item.label}
            </NavLink>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <div className="left">
            <h3>Admin Pizza</h3>
            <FaBars className="menu-icon" />
          </div>

          <div className="right">
            <FaSearch className="search-icon" />
            <div className="user">
              <span>Admin</span>
              <img src={userIcon} alt="user" />
            </div>
          </div>
        </header>

        <div className="content-bar">
          <div className="content">
            <Outlet/>
          </div>
        </div>
      </div>

    </div>
  );
}
