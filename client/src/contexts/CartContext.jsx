import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [orderType, setOrderType] = useState(() => {
    return localStorage.getItem('orderType') || 'DELIVERY';
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('orderType', orderType);
  }, [orderType]);

  const addToCart = (product, quantity = 1, note = '', size = 'M') => {
    setCartItems(prev => {
      // Tìm xem có sản phẩm trùng id và size chưa
      const existing = prev.find(item => item.id === product.id && item.size === size);
      if (existing) {
        toast.info("Đã cập nhật số lượng trong giỏ hàng");
        return prev.map(item =>
          item.id === product.id && item.size === size 
            ? { ...item, quantity: item.quantity + quantity, note } 
            : item
        );
      }
      toast.success("Đã thêm vào giỏ hàng");
      return [...prev, { ...product, quantity, note, size }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.size === size)));
    toast.error("Đã xóa khỏi giỏ hàng");
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity < 1) return removeFromCart(productId, size);
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId && item.size === size 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount,
      orderType, setOrderType
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
