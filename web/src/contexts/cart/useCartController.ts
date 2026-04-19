'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { profileService } from '@/lib/services/profileService';
import { CartDiscount, CartItem } from '@/types/cart';
import { getErrorMessage } from '@/utils/error';
import { getCartFinalPrice, getCartTotalItems, getCartTotalPrice } from './cartPricing';
import { readPersistedCartItems } from './cartStorage';
import { syncCartItemsToBackend } from './cartSync';

export interface CartController {
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
  discount: CartDiscount | null;
  applyCoupon: (code: string) => Promise<void>;
  removeDiscount: () => void;
  couponError: string | null;
  isLoadingCoupon: boolean;
}

export function useCartController(): CartController {
  const [discount, setDiscount] = useState<CartDiscount | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isLoadingCoupon, setIsLoadingCoupon] = useState(false);

  const {
    items,
    addItem: addItemToStore,
    removeItem: removeItemFromStore,
    updateQuantity: updateQuantityInStore,
    clearCart: clearCartInStore,
    isSidebarOpen,
    toggleSidebar: toggleCartSidebar,
  } = useCartStore();

  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const localItems = readPersistedCartItems();
      if (localItems.length > 0) {
        void syncCartItemsToBackend(localItems);
      }
    } catch (error) {
      console.error('Failed to sync cart:', error);
    }
  }, [isAuthenticated]);

  const addItem = async (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    addItemToStore({ ...item, quantity } as CartItem);

    if (isAuthenticated) {
      try {
        await profileService.addToCart(item.id, quantity);
      } catch (error) {
        console.error('Failed to add to backend cart:', error);
      }
    }
  };

  const removeItem = async (id: string) => {
    removeItemFromStore(id);

    if (isAuthenticated) {
      try {
        await profileService.removeFromCart(id);
      } catch (error) {
        console.error('Failed to remove from backend cart:', error);
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    updateQuantityInStore(id, quantity);

    if (isAuthenticated) {
      try {
        await profileService.updateCartItem(id, quantity);
      } catch (error) {
        console.error('Failed to update cart in backend:', error);
      }
    }
  };

  const clearCart = async () => {
    clearCartInStore();
    setDiscount(null);
    setCouponError(null);

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
      const currentTotal = getCartTotalPrice(items);
      const response = await api.post('/coupons/validate', {
        code,
        cartTotal: currentTotal,
        userId: user?.id,
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

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems: () => getCartTotalItems(items),
    getTotalPrice: () => getCartTotalPrice(items),
    getFinalPrice: () => getCartFinalPrice(items, discount),
    isSidebarOpen,
    toggleSidebar: () => toggleCartSidebar(),
    discount,
    applyCoupon,
    removeDiscount: () => {
      setDiscount(null);
      setCouponError(null);
    },
    couponError,
    isLoadingCoupon,
  };
}
