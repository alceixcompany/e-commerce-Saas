import { CartDiscount, CartItem } from '@/types/cart';

export function getCartTotalItems(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotalPrice(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartFinalPrice(items: CartItem[], discount: CartDiscount | null) {
  return getCartTotalPrice(items) - (discount ? discount.discountAmount : 0);
}
