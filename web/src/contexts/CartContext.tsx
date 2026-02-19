'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { removeFromCartBackend, updateCartItem, clearCartBackend, addToCartBackend, fetchProfile } from '@/lib/slices/profileSlice';
import api from '@/lib/api';

interface Discount {
  code: string;
  amount: number;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  _id: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  material?: string;
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
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isLoadingCoupon, setIsLoadingCoupon] = useState(false);

  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.profile);

  // Load cart from localStorage on mount (only if NOT authenticated initially)
  useEffect(() => {
    if (!isAuthenticated) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Failed to load cart from localStorage:', error);
        }
      } else {
        setItems([]);
      }
    }
  }, [isAuthenticated]);

  // Sync Local Cart to Backend on Login
  useEffect(() => {
    if (isAuthenticated) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const localItems: CartItem[] = JSON.parse(savedCart);
          if (localItems.length > 0) {
            // Push local items to backend
            const syncCart = async () => {
              for (const item of localItems) {
                await dispatch(addToCartBackend({ productId: item.id, quantity: item.quantity })).unwrap();
              }
              // Clear local storage after syncing
              localStorage.removeItem('cart');
              // Fetch updated profile to get the merged cart
              dispatch(fetchProfile());
            };
            syncCart();
          } else {
            dispatch(fetchProfile());
          }
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      } else {
        dispatch(fetchProfile());
      }
    }
  }, [isAuthenticated, dispatch]);

  // Sync Backend Cart to Local State (when authenticated)
  useEffect(() => {
    if (isAuthenticated && profile?.cart) {
      // Transform backend cart to frontend structure
      const backendItems = profile.cart.map((item: any) => ({
        id: item.product._id || item.product, // Handle populated or ID
        name: item.product.name || 'Product',
        price: item.product.discountedPrice || item.product.price || 0,
        image: item.product.mainImage || item.product.image || '',
        quantity: item.quantity
      }));
      setItems(backendItems);
    }
  }, [profile, isAuthenticated]);

  // Save cart to localStorage whenever it changes (ONLY if NOT authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  const addItem = async (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    // Optimistic update for UI
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });

    // If authenticated, sync with backend
    if (isAuthenticated) {
      try {
        await dispatch(addToCartBackend({ productId: item.id, quantity })).unwrap();
        // Optionally fetch profile again to be sure
      } catch (error) {
        console.error('Failed to add to backend cart:', error);
      }
    }

    // Open sidebar when item is added
    setIsSidebarOpen(true);
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    // Update local cart
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );

    // Update backend if authenticated
    if (isAuthenticated) {
      try {
        await dispatch(updateCartItem({ productId: id, quantity })).unwrap();
      } catch (error) {
        console.error('Failed to update cart in backend:', error);
      }
    }
  };

  const removeItem = async (id: string) => {
    // Remove from local cart
    setItems((prev) => prev.filter((item) => item.id !== id));

    // Remove from backend if authenticated
    if (isAuthenticated) {
      try {
        await dispatch(removeFromCartBackend(id)).unwrap();
      } catch (error) {
        console.error('Failed to remove from backend cart:', error);
      }
    }
  };

  const clearCart = async () => {
    // Clear local cart
    setItems([]);
    setDiscount(null);
    setCouponError(null);

    // Clear backend if authenticated
    if (isAuthenticated) {
      try {
        await dispatch(clearCartBackend()).unwrap();
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
        userId: profile?._id
      });

      setDiscount(response.data.data);
    } catch (error: any) {
      setDiscount(null);
      setCouponError(error.response?.data?.message || 'Failed to apply coupon');
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

