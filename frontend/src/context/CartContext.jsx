import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) return parsedCart;
      }
    } catch {}
    return [];
  });
  const [error, setError] = useState('');

  // Keep localStorage in sync
  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  // Add or increase quantity
  const addToCart = async (product) => {
    const existingItem = cart.find(item => (item._id || item.id) === (product._id || product.id));
    if (existingItem) {
      await changeQuantity(product, 1);
    } else {
      try {
        await api.post(`/products/${product._id || product.id}/reserve`, { quantity: 1 });
        const productToAdd = {
          _id: product._id || product.id,
          id: product._id || product.id,
          name: product.name,
          price: product.price,
          rating: product.rating || 4.5,
          image: product.image || '',
          quantity: 1
        };
        updateCart([...cart, productToAdd]);
      } catch (err) {
        setError('Stock reserve failed: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Change quantity
  const changeQuantity = async (item, change) => {
    const existingItem = cart.find(cartItem => (cartItem._id || cartItem.id) === (item._id || item.id));
    if (!existingItem) return;
    const prevQuantity = existingItem.quantity;
    const newQuantity = Math.max(1, prevQuantity + change);
    const diff = newQuantity - prevQuantity;
    try {
      if (diff > 0) {
        await api.post(`/products/${item._id || item.id}/reserve`, { quantity: diff });
      } else if (diff < 0) {
        await api.post(`/products/${item._id || item.id}/release`, { quantity: Math.abs(diff) });
      }
      const updatedCart = cart.map(cartItem =>
        ((cartItem._id && cartItem._id === item._id) || (cartItem.id && cartItem.id === item.id))
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
      updateCart(updatedCart);
    } catch (err) {
      setError('Stock update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // Remove item
  const removeFromCart = async (item) => {
    try {
      await api.post(`/products/${item._id || item.id}/release`, { quantity: item.quantity });
      const updatedCart = cart.filter(cartItem =>
        (cartItem._id && cartItem._id !== item._id) ||
        (cartItem.id && cartItem.id !== item.id)
      );
      updateCart(updatedCart);
    } catch (err) {
      setError('Stock release failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await Promise.all(cart.map(item =>
        api.post(`/products/${item._id || item.id}/release`, { quantity: item.quantity })
      ));
      updateCart([]);
    } catch (err) {
      setError('Stock release failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, changeQuantity, removeFromCart, clearCart, error }}>
      {children}
    </CartContext.Provider>
  );
}; 