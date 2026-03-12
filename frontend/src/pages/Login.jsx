import { useState } from "react"

export default function Login(){
    const [login, setLogin] = useState()
    return(
        <div className="login-container">
            <form>
            <h2>Đăng nhập</h2>
                <label>Số điện thoại</label>
                <input type="text" placeholder="Nhập số điện thoại của bạn" />
                <label>Mật khẩu</label>
                <input type="password" placeholder="Nhập mật khẩu của bạn "/>
                
                <div className="link-row">
                    <a href="#">Quên mật khẩu</a>
                </div>

                <div className="checkbox-row">
                    <input type="checkbox"/>
                    <span>Tôi đồng ý với điều khoản</span>
                </div>
                <button className="login-btn" type="submit">Đăng nhập</button>
            </form>
        </div>
    )
};