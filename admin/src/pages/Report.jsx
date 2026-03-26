import "../style/report.css";

export default function Reports() {
  return (
    <div className="reports">
      <h2>Báo cáo & Thống kê</h2>

      {/* FILTER */}
      <div className="filter">
        <select>
          <option>Hôm nay</option>
          <option>7 ngày</option>
          <option>30 ngày</option>
        </select>

        <button>Xem báo cáo</button>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="card">
          <h4>Doanh thu</h4>
          <p>15.000.000đ</p>
        </div>

        <div className="card">
          <h4>Đơn hàng</h4>
          <p>120</p>
        </div>

        <div className="card">
          <h4>Khách hàng</h4>
          <p>45</p>
        </div>

        <div className="card">
          <h4>Tỉ lệ hoàn đơn</h4>
          <p>2%</p>
        </div>
      </div>

      {/* CHART */}
      <div className="chart">
        <h3>Biểu đồ doanh thu</h3>
        <div className="chart-box">
          {/* fake chart */}
          <div className="bar" style={{ height: "60%" }}></div>
          <div className="bar" style={{ height: "80%" }}></div>
          <div className="bar" style={{ height: "40%" }}></div>
          <div className="bar" style={{ height: "90%" }}></div>
          <div className="bar" style={{ height: "70%" }}></div>
        </div>
      </div>

      {/* TOP PRODUCTS */}
      <div className="table">
        <h3>Pizza bán chạy</h3>
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Số lượng</th>
              <th>Doanh thu</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Pizza bò</td>
              <td>120</td>
              <td>24.000.000đ</td>
            </tr>

            <tr>
              <td>Pizza hải sản</td>
              <td>90</td>
              <td>18.000.000đ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}