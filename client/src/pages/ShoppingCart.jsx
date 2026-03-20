import { useState } from "react";
import { products } from "../data/products";
import { FaTrash } from "react-icons/fa";


export default function ShoppingCart() {
    
  // giả lập giỏ hàng (1 sản phẩm để test UI)
  const [cart, setCart] = useState([
    { ...products[0], quantity: 1 }
  ]);

  const increase = (id) => {
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  };

  const decrease = (id) => {
    setCart(cart.map(item =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-container">
      <h2>Sản phẩm</h2>

      {cart.map(item => (
        <div key={item.id} className="cart-item">
          <img src={item.image} alt={item.name} />

          <div className="info">
            <h3>{item.name}</h3>
          </div>

          <div className="quantity">
            <button onClick={() => decrease(item.id)}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => increase(item.id)}>+</button>
          </div>

          <div className="price">
            {(item.price * item.quantity).toLocaleString()}đ
          </div>

          <button
            className="delete"
            onClick={() => removeItem(item.id)}
          >
            <FaTrash />
          </button>
        </div>
      ))}

      <div className="footer-shopping">
        <div className="total">
          Total: <span>{total.toLocaleString()}đ</span>
        </div>

        <div className="actions">
          <button className="continue">&larr; Continues Shopping</button>
          <button className="checkout">Check Out &rarr;</button>
        </div>
      </div>
    </div>
  );
}