// src/hooks/useCart.js
// Convenience hook to consume CartContext.
// Throws a descriptive error if used outside of CartProvider.

import { useContext } from 'react';
import { CartContext } from '@context/CartContext';

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a <CartProvider>.');
  }
  return context;
}
