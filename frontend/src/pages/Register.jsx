import { useState } from "react"

export default function Login(){
    // const [login, setLogin] = useState()
    return(
        <div className="login-container">
            <form>
            <h2>Đăng ký</h2>
                <label>Họ và tên</label>
                <input type="text"/>
                <label>Số điện thoại</label>
                <input type="text" />
                <label>Email</label>
                <input type="text" />
                <label>Mật khẩu</label>
                <input type="password" />
                <label>Xác nhận mật khẩu</label>
                <input type="password"/>

                <div className="checkbox-row">
                    <input type="checkbox"/>
                    <span>Tôi đồng ý với điều khoản</span>
                </div>
                <button className="login-btn" type="submit">Đăng Ký</button>
            </form>
        </div>
    )
};