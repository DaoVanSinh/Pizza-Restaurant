import LogoImg from "../assets/logo.png";
import { Link, NavLink } from "react-router-dom";
import Noti from "../assets/noti.png";

export default function Footer() {
  return (
    <footer className="bg-[#0b6b2d] text-white grid grid-cols-1 md:grid-cols-4 gap-8 px-10 py-[40px] mt-10">
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <img src={LogoImg} alt="Logo" className="w-[150px] md:w-[200px]" />
        <div className="mt-4">
          <span className="font-bold text-lg">094349388</span>
          <p className="font-semibold text-sm">GIAO HÀNG NHANH</p>
        </div>
      </div>

      <div className="flex flex-col items-center md:items-start space-y-2 text-sm">
        <h3 className="text-lg font-bold mb-2">GIỚI THIỆU</h3>
        <NavLink to="/" className="hover:underline">Hệ thống nhà hàng</NavLink>
        <NavLink to="/" className="hover:underline">Câu chuyện thương hiệu</NavLink>
        <NavLink to="/" className="hover:underline">Tin tức và sự kiện</NavLink>
        <NavLink to="/" className="hover:underline">Tuyển dụng</NavLink>
        <h3 className="text-lg font-bold mt-4 mb-2">VĂN PHÒNG ĐẠI DIỆN</h3>
        <p className="text-gray-200">
          Công ty Cổ phần Pizza Ngon 77 Trần Nhân Tôn, Phường 9, Quận 5, Thành phố Hồ Chí Minh <br/>
          SĐT: +84 (028) 7308 3377 MST: 0104115527 Cấp lần đầu ngày 17/08/2009
        </p>
      </div>

      <div className="flex flex-col items-center md:items-start space-y-2 text-sm">
        <h3 className="text-lg font-bold mb-2">LIÊN HỆ</h3>
        <NavLink to="/" className="hover:underline">Hướng dẫn mua hàng</NavLink>
        <NavLink to="/" className="hover:underline">Thông báo về lịch hoạt động lễ tết</NavLink>
        <NavLink to="/" className="hover:underline">Chính sách giao hàng</NavLink>
        <NavLink to="/" className="hover:underline">Chính sách bảo mật</NavLink>
        <NavLink to="/" className="hover:underline">Điều khoản và Điều kiện</NavLink>
        
        <h3 className="text-lg font-bold mt-4 mb-2">TỔNG ĐÀI HỖ TRỢ</h3>
        <span className="text-gray-200">Đặt hàng: 1900 6066 (9:30 - 21:30)</span>
        <span className="text-gray-200">Tổng đài CSKH: 1900 633 606 (9:30 - 21:30)</span>
      </div>

      <div className="flex flex-col items-center md:items-start">
        <h3 className="text-lg font-bold mb-4">LIÊN HỆ VỚI CHÚNG TÔI</h3>
        <img src={Noti} alt="noti" className="w-[120px] md:w-[150px]" />
      </div>
    </footer>
  );
}