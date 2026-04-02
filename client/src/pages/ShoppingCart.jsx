import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import axios from "axios";

export default function ShoppingCart() {
    
    const [cart, setCart] = useState([]); 

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            const orderData = {
                totalPrice: total,
                items: cart,
                status: "Chờ xác nhận"
            };
            
            await axios.post("http://localhost:8080/api/orders/create", orderData);
            alert("Đặt hàng thành công!");
            setCart([]);
        } catch (err) {
            alert("Lỗi khi đặt hàng!");
        }
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="cart-container">
            <h2>Sản phẩm trong giỏ</h2>
            {}
            <div className="footer-shopping">
                <div className="total">
                    Total: <span>{total.toLocaleString()}đ</span>
                </div>
                <div className="actions">
                    <button className="continue">Tiếp tục mua hàng</button>
                    <button className="checkout" onClick={handleCheckout}>Thanh toán &rarr;</button>
                </div>
            </div>
        </div>
    );
}