import { useState } from "react";
import axios from "axios";

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }
        try {
            
            await axios.post("http://localhost:8080/api/users/register", formData);
            alert("Đăng ký thành công!");
        } catch (err) {
            alert("Số điện thoại hoặc Email đã tồn tại!");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <h2>Đăng ký</h2>
                <label>Họ và tên</label>
                <input type="text" onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                <label>Số điện thoại</label>
                <input type="text" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <label>Email</label>
                <input type="text" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <label>Mật khẩu</label>
                <input type="password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                <label>Xác nhận mật khẩu</label>
                <input type="password" onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />

                <div className="checkbox-row">
                    <input type="checkbox" required />
                    <span>Tôi đồng ý với điều khoản</span>
                </div>
                <button className="login-btn" type="submit">Đăng Ký</button>
            </form>
        </div>
    );
};