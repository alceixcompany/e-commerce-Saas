'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { profileService } from '@/lib/services/profileService';
import api from '@/lib/api';

import { CartItem, CartDiscount as Discount } from '@/types/cart';
import { getErrorMessage } from '@/utils/error';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface BackendCartItem {
  product: {
    _id: string;
    name?: string;
    price?: number;
    discountedPrice?: number;
    mainImage?: string;
    image?: string;
  } | string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getFinalPrice: () => number;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  discount: Discount | null;
  applyCoupon: (code: string) => Promise<void>;
  removeDiscount: () => void;
  couponError: string | null;
  isLoadingCoupon: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isLoadingCoupon, setIsLoadingCoupon] = useState(false);

  // Zustand Stores
  const { 
    items, 
    addItem: addItemZustand, 
    removeItem: removeItemZustand, 
    updateQuantity: updateQuantityZustand,
    clearCart: clearCartZustand,
    isSidebarOpen,
    toggleSidebar
  } = useCartStore();
  
  const { isAuthenticated, user } = useAuthStore();
  
  // Sync Local Cart to Backend on Login
  useEffect(() => {
    if (isAuthenticated) {
      const savedCart = localStorage.getItem('cart-storage');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          const localItems: CartItem[] = parsed.state?.items || [];
          
          if (localItems.length > 0) {
            const syncCart = async () => {
              for (const item of localItems) {
                await profileService.addToCart(item.id, item.quantity);
              }
            };
            syncCart();
          }
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      }
    }
  }, [isAuthenticated]);

  const addItem = async (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    // Update Zustand Store (Optimistic)
    addItemZustand({ ...item, quantity } as CartItem);

    // If authenticated, sync with backend
    if (isAuthenticated) {
      try {
        await profileService.addToCart(item.id, quantity);
      } catch (error) {
        console.error('Failed to add to backend cart:', error);
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    // Update Zustand Store
    updateQuantityZustand(id, quantity);

    // Update backend if authenticated
    if (isAuthenticated) {
      try {
        await profileService.updateCartItem(id, quantity);
      } catch (error) {
        console.error('Failed to update cart in backend:', error);
      }
    }
  };

  const removeItem = async (id: string) => {
    // Update Zustand Store
    removeItemZustand(id);

    // Remove from backend if authenticated
    if (isAuthenticated) {
      try {
        await profileService.removeFromCart(id);
      } catch (error) {
        console.error('Failed to remove from backend cart:', error);
      }
    }
  };

  const clearCart = async () => {
    // Update Zustand Store
    clearCartZustand();
    setDiscount(null);
    setCouponError(null);

    // Clear backend if authenticated
    if (isAuthenticated) {
      try {
        await profileService.clearCart();
      } catch (error) {
        console.error('Failed to clear backend cart:', error);
      }
    }
  };

  const applyCoupon = async (code: string) => {
    setIsLoadingCoupon(true);
    setCouponError(null);
    try {
      const currentTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const response = await api.post('/coupons/validate', {
        code,
        cartTotal: currentTotal,
        userId: user?.id
      });

      setDiscount(response.data.data);
    } catch (error: unknown) {
      setDiscount(null);
      const message = getErrorMessage(error);
      setCouponError(message || 'Failed to apply coupon');
      throw error;
    } finally {
      setIsLoadingCoupon(false);
    }
  };

  const removeDiscount = () => {
    setDiscount(null);
    setCouponError(null);
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getFinalPrice: () => {
          const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          return total - (discount ? discount.discountAmount : 0);
        },
        isSidebarOpen,
        toggleSidebar,
        discount,
        applyCoupon,
        removeDiscount,
        couponError,
        isLoadingCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
