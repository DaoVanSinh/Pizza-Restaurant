import { useState, useEffect } from "react";
import "../../style/Staff.css";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { userApi } from "../../services/modules/user.api";

export default function Staff() {
  const [search, setSearch] = useState("");
  const [staffs, setStaffs] = useState([]);

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const res = await userApi.getAllUsers();
      setStaffs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa nhân viên này?")) {
      try {
        await userApi.deleteUser(id);
        setStaffs(staffs.filter((s) => s.id !== id));
      } catch (error) {
        toast.error("Lỗi khi xóa nhân viên!");
      }
    }
  };

  const filtered = staffs.filter((s) =>
    (s.fullName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="staff">
      <h2>Quản lý nhân viên</h2>

      <div className="top-bar">
        <input
          type="text"
          placeholder="Tìm nhân viên..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to="/addStaff" className="btn">+ Thêm nhân viên</Link>
      </div>

      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Họ Tên</th>
              <th>Số điện thoại</th>
              <th>Chức vụ (Role)</th>
              <th>Email</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((staff) => (
              <tr key={staff.id}>
                <td className="name-cell">
                  <div className="avatar"></div>
                  {staff.fullName}
                </td>

                <td>{staff.phone}</td>
                <td><span className="status active">{staff.role}</span></td>
                <td>{staff.email}</td>

                <td>
                  <button className="delete" onClick={() => handleDelete(staff.id)}>Xóa</button>
                </td>
              </tr>
            ))}
            
            {filtered.length === 0 && (
                <tr>
                    <td colSpan={5} style={{textAlign: "center", padding: "20px 0"}}>Không tìm thấy nhân viên nào</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}