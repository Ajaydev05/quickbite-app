import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart, updateCartItem, clearCart } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user }              = useAuth();
  const [cart, setCart]       = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
    else      setCart({ items: [], total: 0 });
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await getCart();
      setCart(data.cart || { items: [], total: 0 });
    } catch {}
  };

  const addItem = async (menuItemId, quantity = 1, customizations = []) => {
    if (!user) { toast.error('Please login to add items'); return; }
    setLoading(true);
    try {
      const { data } = await addToCart({ menuItemId, quantity, customizations });
      setCart(data.cart);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add item');
    } finally { setLoading(false); }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const { data } = await updateCartItem(itemId, { quantity });
      setCart(data.cart);
    } catch {}
  };

  const emptyCart = async () => {
    await clearCart();
    setCart({ items: [], total: 0 });
  };

  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, emptyCart, fetchCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};
