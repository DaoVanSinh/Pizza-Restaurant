import { Navigate } from "react-router-dom";

/**
 * Component gói các trang cần bảo vệ khỏi người dùng chưa đăng nhập.
 * @param {children} Phần tử con bên trong
 * @param {allowedRoles} Danh sách các role được phép truy cập (VD: ["ADMIN", "STAFF"]). Nếu trống, chỉ cần login là được.
 */
export default function AuthGuard({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("jwt_token");
  const userInfoStr = localStorage.getItem("user_info");

  // Kiểm tra xem token và userInfo có thực sự hợp lệ không (không phải chuỗi "null" hay "undefined")
  const isValidToken = token && token !== "null" && token !== "undefined";
  const isValidUserInfo = userInfoStr && userInfoStr !== "null" && userInfoStr !== "undefined";

  // 1. Chưa đăng nhập hoặc dữ liệu rác -> Đá ra trang login và xóa sạch rác
  if (!isValidToken || !isValidUserInfo) {
    if (token || userInfoStr) localStorage.clear(); // Xóa nếu có rác
    return <Navigate to="/login" replace />;
  }

  let userInfo;
  try {
    userInfo = JSON.parse(userInfoStr);
  } catch (e) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  // 2. Kiểm tra Role
  const userRole = userInfo?.role;
  const normalizedUserRole = userRole?.toUpperCase();
  const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());

  if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(normalizedUserRole)) {
    // Nếu là route gốc (allowedRoles gồm nhiều role) thì đá về login
    // Nếu là route admin-only mà STAFF cố vào → redirect về trang chủ (không logout)
    const isTopLevel = allowedRoles.some(r => r.toUpperCase() === "ADMIN" && allowedRoles.includes("STAFF"));
    if (isTopLevel) {
      // Chưa đăng nhập đúng role cần thiết ở cấp gốc → logout
      console.warn("Truy cập bị từ chối: Role không hợp lệ -", userRole);
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }
    // Route con chỉ dành cho ADMIN, STAFF cố vào → về trang chủ (giữ nguyên session)
    console.warn("STAFF không có quyền truy cập trang này, redirect về /");
    return <Navigate to="/" replace />;
  }

  // 3. Hợp lệ -> Cho phép xem
  return children;
}
