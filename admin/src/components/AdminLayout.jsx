import { FaPizzaSlice, FaUtensils, FaBars, FaSearch, FaHome, FaUsers, FaUser, FaBoxOpen, FaCashRegister, FaChevronDown, FaShoppingBag, FaReceipt, FaChartBar, FaTag } from "react-icons/fa";
import userIcon from "../assets/userIcon.png";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import ModalAccount from "./ModalAccount";
import { getImg } from "../lib/utils";
import { userApi } from "../services/modules/user.api";
import { useEffect } from "react";
import { useAdminOrders } from "../hooks/useAdminOrders";

// Danh sách menu đầy đủ với thuộc tính adminOnly
const ALL_MENU = [
  { icon: <FaHome />, label: "Trang chủ", path: "/", adminOnly: false },
  { icon: <FaShoppingBag />, label: "Đơn hàng", path: "/orders", adminOnly: false },
  { icon: <FaReceipt />, label: "Giao dịch", path: "/transactions", adminOnly: false },
  { icon: <FaBoxOpen />, label: "Sản phẩm", path: "/products", adminOnly: true },
  { icon: <FaTag />, label: "Khuyến mãi", path: "/promotions", adminOnly: true },
  { icon: <FaChartBar />, label: "Báo cáo", path: "/dashboard", adminOnly: true },
  { icon: <FaUsers />, label: "Nhân viên", path: "/staff", adminOnly: true },
  { icon: <FaUser />, label: "Tài khoản", path: "/account", adminOnly: false },
  { icon: <FaCashRegister />, label: "POS", path: "/pos", adminOnly: false },
];

export default function AdminLayout() {
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem("user_info") || "{}"));
  const { orders: pendingOrders } = useAdminOrders("pending");
  const pendingCount = pendingOrders?.length || 0;

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
  const userRole = (userInfo.role || "").toLowerCase();
  const isAdmin = userRole === "admin";

  // Lọc menu theo role
  const menu = ALL_MENU.filter(item => !item.adminOnly || isAdmin);

  const roleBadgeStyle = {
    fontSize: "10px",
    padding: "2px 7px",
    borderRadius: "99px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    background: isAdmin ? "rgba(11,107,45,0.18)" : "rgba(16,185,129,0.18)",
    color: isAdmin ? "#0b6b2d" : "#10b981",
    border: isAdmin ? "1px solid rgba(11,107,45,0.35)" : "1px solid rgba(16,185,129,0.35)",
    marginLeft: "6px",
    verticalAlign: "middle",
  };

  return (
    <div className={`admin-container ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
      <div className="sidebar">
        {menu.map((item) => (
          <div className="item-sidebar" key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              <div className="flex items-center gap-3 w-full">
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {(item.path === "/orders" || item.path === "/pos") && pendingCount > 0 && (
                  <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm ml-auto">
                    {pendingCount}
                  </span>
                )}
              </div>
            </NavLink>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <div className="left">
            <h3 className="sidebar-title">Restaurant Pizza</h3>
            <FaBars className="menu-icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div>

          <div className="right">
            <FaSearch className="search-icon" />
            <div className="user" onClick={() => setShowModal(prev => !prev)}>
              <img src={displayAvatar} alt="user" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
              <span className="font-semibold">{displayName}</span>
              <span style={roleBadgeStyle}>{isAdmin ? "ADMIN" : "STAFF"}</span>
              <FaChevronDown className="w-3 h-3 ml-1 opacity-70" />
              <div className={`modal-account ${showModal ? "show" : ""}`}>
                <ModalAccount />
              </div>
            </div>
          </div>
        </header>

        <div className="content-bar">
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>

    </div>
  );
}
