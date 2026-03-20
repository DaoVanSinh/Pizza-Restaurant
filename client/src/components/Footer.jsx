import LogoImg from "../assets/logo.png";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import Noti from "../assets/noti.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footerContent">
        <img src={LogoImg} alt="Logo" className="footerLogo" />
        <div className="hotline">
          <span>094349388</span>
          <p>GIAO HÀNG NHANH</p>
        </div>
      </div>

      <div className="footerContent">
        <h3>GIỚI THIỆU</h3>
        <NavLink to="/">Hệ thống nhà hàng</NavLink>
        <NavLink to="/">Câu chuyện thương hiệu</NavLink>
        <NavLink to="/">Tin tức và sự kiện</NavLink>
        <NavLink to="/">Tuyển dụng</NavLink>
        <h3>VĂN PHÒNG ĐẠI DIỆN</h3>
        <p>Công ty Cổ phần Pizza Ngon  77 Trần Nhân Tôn, Phường 9, Quận 5, Thành phố Hồ Chí Minh 
          SĐT: +84 (028) 7308 3377 MST: 0104115527 Cấp lần đầu ngày 17 tháng 08 năm 2009
          và có thể được sửa đổi vào từng thời điểm</p>

      </div>
      <div className="footerContent">
        <h3>LIÊN HỆ</h3>
        <NavLink to="/">Hướng dẫn mua hàng</NavLink>
        <NavLink to="/">Thông báo về lịch hoạt động nhưng ngày lễ tết</NavLink>
        <NavLink to="/">Chính sách giao hàng</NavLink>
        <NavLink to="/">Chính sách bảo mật</NavLink>
        <NavLink to="/">Điều khoản và Điều kiên</NavLink>
        <h3>TỔNG ĐÀI HỖ TRỢ</h3>
        <NavLink to="/">Đặt hàng: 1900 6066 (9:30 - 21:30)</NavLink>
        <NavLink to="/">Tổng đài CSKH: 1900 633 606 (9:30 - 21:30)</NavLink>
      </div>
      <div className="footerContent">
        <h3>LIÊN HỆ VỚI CHÚNG TÔI</h3>
        <div className="mxh"></div>
        <img src={Noti} alt="noti" className="footerLogo" />
      </div>
    </footer>
  );
}