import { profileService } from '@/lib/services/profileService';
import { CartItem } from '@/types/cart';

export async function syncCartItemsToBackend(items: CartItem[]) {
  for (const item of items) {
    await profileService.addToCart(item.id, item.quantity);
  }
}
