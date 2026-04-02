import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [agree, setAgree] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agree) {
            alert("Bạn cần đồng ý các điều khoản");
            return;
        }
        try {
            
            const res = await axios.post("http://localhost:8080/api/auth/login", { phone, password });
            alert("Đăng nhập thành công!");
            
            if (res.data.role === "ADMIN") navigate("/admin");
            else navigate("/");
        } catch (err) {
            alert("Sai số điện thoại hoặc mật khẩu!");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <h2>Đăng nhập</h2>
                <label>Số điện thoại</label>
                <input type="text" placeholder="Nhập số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <label>Mật khẩu</label>
                <input type="password" placeholder="Nhập mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
                
                <div className="link-row">
                    <a href="#">Quên mật khẩu</a>
                </div>

                <div className="checkbox-row">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    <span>Tôi đồng ý với điều khoản</span>
                </div>
                <button className="login-btn" type="submit">Đăng nhập</button>
            </form>
        </div>
    );
};