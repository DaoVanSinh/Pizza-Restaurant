import { FaPizzaSlice, FaUtensils, FaBars, FaSearch, FaHome, FaUsers, FaUser, FaBoxOpen, FaCashRegister, FaChevronDown, FaShoppingBag, FaReceipt } from "react-icons/fa";
import { BiSolidOffer } from "react-icons/bi";
import userIcon from "../assets/userIcon.png";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import ModalAccount from "./ModalAccount";




import { getImg } from "../lib/utils";
import { userApi } from "../services/modules/user.api";
import { useEffect } from "react";

export default function AdminLayout() {
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem("user_info") || "{}"));

  useEffect(() => {
    userApi.getProfile().then(res => {
      const p = res.data;
      if (p) {
        setUserInfo(prev => {
          const updated = { 
             ...prev, 
             fullName: p.fullName, 
             avatarUrl: p.avatar || prev.avatarUrl 
          };
          localStorage.setItem("user_info", JSON.stringify(updated));
          return updated;
        });
      }
    }).catch(e => console.error("No profile sync", e));
  }, []);

  const displayAvatar = userInfo.avatarUrl ? getImg(userInfo.avatarUrl) : userIcon;
  const displayName = userInfo.fullName || userInfo.username || "Admin";

  const menu = [
  { icon: <FaHome />, label: "Trang chủ", path: "/" },
  { icon: <FaShoppingBag />, label: "Đơn hàng", path: "/orders" },
  { icon: <FaReceipt />, label: "Giao dịch", path: "/transactions" },
  { icon: <FaBoxOpen />, label: "Sản phẩm", path: "/products" },
  { icon: <BiSolidOffer />, label: "Khuyến mãi", path: "/promotion" },
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
            <div className="user" onClick={() => setShowModal(prev => !prev)}>
              <img src={displayAvatar} alt="user" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
              <span className="font-semibold">{displayName}</span><FaChevronDown className="w-3 h-3 ml-1 opacity-70" />
              <div className={`modal-account ${showModal ? "show" : ""}`}>
                <ModalAccount />
              </div>
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
