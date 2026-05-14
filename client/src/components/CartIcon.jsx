import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../contexts/CartContext";

export default function CartIcon() {
  const { getCartCount } = useCart();
  const count = getCartCount();

  return (
    <Link to="/shoppingcart" className="relative flex items-center justify-center text-white hover:text-green-200 transition-colors">
      <div className="relative flex items-center gap-2">
        <div className="relative">
          <FaShoppingCart size={22} />
          {count > 0 && (
            <span className="absolute -top-3 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shadow-md border-2 border-[#0b6b2d]">
              {count}
            </span>
          )}
        </div>
        <span className="font-semibold hidden md:inline-block">Giỏ hàng</span>
      </div>
    </Link>
  );
}