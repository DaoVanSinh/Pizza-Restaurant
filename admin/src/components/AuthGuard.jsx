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

  // 2. Đã đăng nhập nhưng Role bị cấm truy cập -> Đá về root hoặc báo lỗi
  const userRole = userInfo?.role;
  const normalizedUserRole = userRole?.toUpperCase();
  const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());

  if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(normalizedUserRole)) {
    console.warn("Truy cập bị từ chối: Role không hợp lệ -", userRole);
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  // 3. Hợp lệ -> Cho phép xem
  return children;
}
