import { useState } from "react";
import "../../style/Staff.css";
import { Link } from "react-router-dom";

const mockStaff = [
  {
    id: 1,
    name: "Nguyễn Văn Nam",
    role: "Giao hàng",
    shift: "Ca sáng",
    status: true
  },
  {
    id: 2,
    name: "Trần Thị Lan",
    role: "Thu ngân",
    shift: "Ca tối",
    status: false
  }
];

export default function Staff() {
  const [search, setSearch] = useState("");

  const filtered = mockStaff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="staff">
      <h2>Quản lý nhân viên</h2>

      {/* TOP BAR */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Tìm nhân viên..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to="/addStaff" className="btn">+ Thêm nhân viên</Link>
      </div>

      {/* TABLE */}
      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Chức vụ</th>
              <th>Ca làm</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((staff) => (
              <tr key={staff.id}>
                <td className="name-cell">
                  <div className="avatar"></div>
                  {staff.name}
                </td>

                <td>{staff.role}</td>
                <td>{staff.shift}</td>

                <td>
                  <span
                    className={
                      staff.status ? "status active" : "status inactive"
                    }
                  >
                    {staff.status ? "Đang làm" : "Nghỉ"}
                  </span>
                </td>

                <td>
                  <button className="edit">Sửa</button>
                  <button className="delete">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}