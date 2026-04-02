import { useState, useEffect } from "react";
import axios from "axios";
import "../style/report.css";

export default function Reports() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });

  useEffect(() => {
    axios.get("http://localhost:8080/api/dashboard/stats")
      .then(res => setStats(res.data));
  }, []);

  return (
    <div className="reports">
      <h2>Báo cáo & Thống kê</h2>
      <div className="filter">
        <select><option>Hôm nay</option></select>
        <button>Xem báo cáo</button>
      </div>

      <div className="stats">
        <div className="card">
          <h4>Doanh thu</h4>
          <p>{stats.revenue?.toLocaleString()}đ</p>
        </div>
        <div className="card">
          <h4>Đơn hàng</h4>
          <p>{stats.orders}</p>
        </div>
        <div className="card">
          <h4>Khách hàng</h4>
          <p>{stats.customers}</p>
        </div>
        <div className="card">
          <h4>Sản phẩm</h4>
          <p>{stats.products}</p>
        </div>
      </div>

      {}
      <div className="chart">
        <h3>Biểu đồ doanh thu</h3>
        <div className="chart-box">
          <div className="bar" style={{ height: "60%" }}></div>
          <div className="bar" style={{ height: "80%" }}></div>
          <div className="bar" style={{ height: "90%" }}></div>
        </div>
      </div>

      <div className="table">
        <h3>Pizza bán chạy</h3>
        <table>
          <thead>
            <tr><th>Tên</th><th>Số lượng</th><th>Doanh thu</th></tr>
          </thead>
          <tbody>
            <tr><td>Pizza bò</td><td>120</td><td>24.000.000đ</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}