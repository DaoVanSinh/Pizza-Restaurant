import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";


export default function CartIcon({count = 0}) {
  return (
    <Link to="/shoppingcart" className="cart-wrapper">
      <FaShoppingCart size={22} />

      <span className="cart-text">Giỏ hàng</span>

      {count > 0 && (
        <span className="cart-badge">{count}</span>
      )}
    </Link>
  );
}