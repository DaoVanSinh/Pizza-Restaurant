import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      // Key = id + selectedSize để phân biệt cùng sản phẩm khác size
      const cartKey = product.cartKey || `${product.id}_${product.selectedSize ?? 'default'}`;
      const existingProduct = prevCart.find((item) => {
        const itemKey = item.cartKey || `${item.id}_${item.selectedSize ?? 'default'}`;
        return itemKey === cartKey;
      });

      if (existingProduct) {
        return prevCart.map((item) => {
          const itemKey = item.cartKey || `${item.id}_${item.selectedSize ?? 'default'}`;
          return itemKey === cartKey
            ? { ...item, quantity: (item.quantity || 1) + (product.quantity || 1) }
            : item;
        });
      }
      return [...prevCart, { ...product, cartKey, quantity: product.quantity || 1 }];
    });
  };

  const removeFromCart = (cartKey) => {
    setCart((prevCart) => prevCart.filter((item) => {
      const itemKey = item.cartKey || `${item.id}_${item.selectedSize ?? 'default'}`;
      return itemKey !== cartKey;
    }));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
