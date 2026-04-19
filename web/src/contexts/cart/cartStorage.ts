import { CartItem } from '@/types/cart';

export const CART_STORAGE_KEY = 'cart-storage';

interface PersistedCartState {
  state?: {
    items?: CartItem[];
  };
}

export function readPersistedCartItems(): CartItem[] {
  if (typeof window === 'undefined') return [];

  const savedCart = localStorage.getItem(CART_STORAGE_KEY);
  if (!savedCart) return [];

  const parsed = JSON.parse(savedCart) as PersistedCartState;
  return parsed.state?.items || [];
}
