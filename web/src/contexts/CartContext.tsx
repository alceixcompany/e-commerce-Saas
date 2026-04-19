'use client';

import { createContext, useContext, ReactNode } from 'react';
import { CartController, useCartController } from './cart/useCartController';

const CartContext = createContext<CartController | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCartController();

  return (
    <CartContext.Provider value={cart}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
