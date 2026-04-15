import { useState, useEffect } from "react";
import "../../style/Staff.css";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { userApi } from "../../services/modules/user.api";

// Hàm lấy initials từ tên
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Màu avatar ngẫu nhiên theo tên
function getAvatarColor(name) {
  const colors = ["#e53935","#1976d2","#388e3c","#f57c00","#7b1fa2","#0097a7","#c2185b","#455a64"];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// Config hiển thị theo role
const ROLE_CONFIG = {
  admin:   { label: "Quản lý",  badge: "role-admin",   icon: "👑" },
  staff:   { label: "Nhân viên", badge: "active",        icon: "👤" },
};

export default function Staff() {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all"); // all | admin | staff
  const [staffs, setStaffs]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null); // id đang xóa

  useEffect(() => { fetchStaffs(); }, []);

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllUsers();
      setStaffs(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name, role) => {
    const roleLabel = role?.toLowerCase() === "admin" ? "quản lý" : "nhân viên";
    if (!window.confirm(`Vô hiệu hóa tài khoản ${roleLabel} "${name}"?\n\nTài khoản sẽ không thể đăng nhập nữa.`)) return;

    setDeleting(id);
    try {
      await userApi.deleteUser(id);
      // Đánh dấu deletedAt = now thay vì xóa khỏi list → hiển thị trạng thái vô hiệu
      setStaffs(prev => prev.map(s => s.id === id ? { ...s, deletedAt: new Date().toISOString() } : s));
      toast.success(`✅ Đã vô hiệu hóa tài khoản "${name}"`);
    } catch (error) {
      toast.error(error?.response?.data || "Lỗi khi vô hiệu hóa tài khoản!");
    } finally {
      setDeleting(null);
    }
  };

  // Lọc kết hợp role + search
  const filtered = staffs.filter(s => {
    const role = (s.role || "").toLowerCase();
    const matchRole = filter === "all" || role === filter;
    const matchSearch = !search ||
      [(s.fullName || ""), (s.username || ""), (s.email || ""), (s.phone || "")]
        .some(f => f.toLowerCase().includes(search.toLowerCase()));
    return matchRole && matchSearch;
  });

  const formatDate = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("vi-VN");
  };

  const countByRole = (role) => staffs.filter(s => (s.role || "").toLowerCase() === role).length;

  return (
    <div className="staff">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <h2 style={{ margin: 0 }}>Quản lý Nhân sự</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: "14px" }}>
            Quản lý tài khoản nhân viên và quản lý cửa hàng
          </p>
        </div>
        <Link to="/addStaff" className="btn">+ Thêm tài khoản</Link>
      </div>

      {/* Thống kê nhanh */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        {[
          { key: "all",   label: "Tất cả",    count: staffs.length,       color: "#6b7280" },
          { key: "admin", label: "👑 Quản lý",  count: countByRole("admin"), color: "#7b1fa2" },
          { key: "staff", label: "👤 Nhân viên", count: countByRole("staff"), color: "#1976d2" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: `2px solid ${filter === tab.key ? tab.color : "#e0e0e0"}`,
              background: filter === tab.key ? tab.color : "white",
              color: filter === tab.key ? "white" : "#555",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {tab.label}
            <span style={{
              background: filter === tab.key ? "rgba(255,255,255,0.3)" : "#f0f0f0",
              color: filter === tab.key ? "white" : "#666",
              borderRadius: "10px",
              padding: "1px 7px",
              fontSize: "12px",
              fontWeight: 700,
            }}>{tab.count}</span>
          </button>
        ))}

        <input
          type="text"
          placeholder="🔍 Tìm theo tên, email, SĐT..."
          onChange={(e) => setSearch(e.target.value)}
          style={{
            marginLeft: "auto",
            padding: "8px 14px",
            border: "1px solid #e0e0e0",
            borderRadius: "20px",
            fontSize: "13px",
            width: "250px",
            outline: "none",
          }}
        />
      </div>

      <div className="table">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>Đang tải...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nhân sự</th>
                <th>Tên đăng nhập</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((staff) => {
                const displayName = staff.fullName || staff.username || "—";
                const avatarBg    = getAvatarColor(displayName);
                const role        = (staff.role || "staff").toLowerCase();
                const cfg         = ROLE_CONFIG[role] || ROLE_CONFIG.staff;
                const isDisabled  = !!staff.deletedAt;

                return (
                  <tr key={staff.id} style={{ opacity: isDisabled ? 0.55 : 1 }}>
                    <td className="name-cell">
                      <div
                        className="avatar"
                        style={{
                          background: isDisabled ? "#bbb" : avatarBg,
                          color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: "13px", flexShrink: 0,
                        }}
                      >
                        {getInitials(displayName)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{displayName}</div>
                        {staff.fullName && staff.username && (
                          <div style={{ fontSize: "11px", color: "#999" }}>@{staff.username}</div>
                        )}
                      </div>
                    </td>
                    <td style={{ color: "#555", fontSize: "13px" }}>{staff.username || "—"}</td>
                    <td>{staff.email}</td>
                    <td>{staff.phone || "—"}</td>
                    <td>
                      <span className={`status ${cfg.badge}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td>
                      {isDisabled ? (
                        <span className="status" style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" }}>
                          🚫 Đã vô hiệu
                        </span>
                      ) : (
                        <span className="status active">✅ Hoạt động</span>
                      )}
                    </td>
                    <td style={{ fontSize: "13px", color: "#666" }}>{formatDate(staff.createdAt)}</td>
                    <td>
                      {!isDisabled ? (
                        <button
                          className="delete"
                          disabled={deleting === staff.id}
                          onClick={() => handleDelete(staff.id, displayName, staff.role)}
                          title={`Vô hiệu hóa tài khoản ${cfg.label}`}
                        >
                          {deleting === staff.id ? "⏳" : "🚫 Vô hiệu"}
                        </button>
                      ) : (
                        <span style={{ color: "#bbb", fontSize: "12px" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px 0", color: "#aaa" }}>
                    {search ? `Không tìm thấy kết quả cho "${search}"` : "Chưa có tài khoản nào"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}