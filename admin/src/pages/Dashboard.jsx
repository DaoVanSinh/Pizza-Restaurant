import "../style/dashboard.css"

export default function Dashboard() {
  return (
    <div className="home-wrapper">
      <h2 className="home-title">Tổng quan cửa hàng</h2>

      {/* KPI */}
      <div className="home-kpi-grid">
        <div className="home-kpi-card green">
          <p>Doanh thu hôm nay</p>
          <h3>6.500.000đ</h3>
        </div>

        <div className="home-kpi-card blue">
          <p>Đơn hàng</p>
          <h3>58</h3>
        </div>

        <div className="home-kpi-card orange">
          <p>Khách mới</p>
          <h3>18</h3>
        </div>

        <div className="home-kpi-card red">
          <p>Sản phẩm</p>
          <h3>72</h3>
        </div>
      </div>

      {/* MAIN */}
      <div className="home-layout">
        {/* LEFT */}
        <div className="home-left-col">
          {/* CHART */}
          <div className="home-box">
            <h3>Doanh thu tuần</h3>
            <div className="home-chart">
              <div style={{ height: "40%" }}></div>
              <div style={{ height: "70%" }}></div>
              <div style={{ height: "55%" }}></div>
              <div style={{ height: "85%" }}></div>
              <div style={{ height: "65%" }}></div>
              <div style={{ height: "50%" }}></div>
              <div style={{ height: "75%" }}></div>
            </div>
          </div>

          {/* ORDER LIST */}
          <div className="home-box">
            <h3>Đơn hàng mới</h3>
            <table className="home-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Khách</th>
                  <th>Món</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>#101</td>
                  <td>Minh</td>
                  <td>Pizza bò</td>
                  <td><span className="tag done">Đã giao</span></td>
                </tr>

                <tr>
                  <td>#102</td>
                  <td>Hà</td>
                  <td>Mì ý</td>
                  <td><span className="tag pending">Đang xử lý</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT */}
        <div className="home-right-col">
          <div className="home-box warning">
            <h3>⚠ Cảnh báo</h3>
            <ul>
              <li>Phô mai sắp hết</li>
              <li>Bột mì dưới mức an toàn</li>
              <li>2 đơn đang trễ</li>
            </ul>
          </div>

          <div className="home-box">
            <h3>Top bán chạy</h3>
            <ul className="home-list">
              <li>🍕 Pizza bò</li>
              <li>🍕 Pizza hải sản</li>
              <li>🍝 Mì ý sốt kem</li>
            </ul>
          </div>

          <div className="home-box">
            <h3>Hoạt động</h3>
            <ul className="home-activity">
              <li>✔ Thêm sản phẩm mới</li>
              <li>✔ Đơn #100 hoàn tất</li>
              <li>✔ Nhân viên đăng nhập</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}