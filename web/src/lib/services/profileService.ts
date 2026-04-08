import api from '../api';
import { UserProfile, UpdateProfilePayload, AddressPayload } from '@/types/profile';

export const profileService = {
  // 1. Fetch User Profile
  fetchProfile: async (options: { silent?: boolean } = {}) => {
    const requestConfig: any = {
      headers: { 'Cache-Control': 'no-cache' }
    };
    if (options.silent) {
      requestConfig.skipAuthRedirect = true;
    }

    const response = await api.get('/profile', requestConfig);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch profile');
  },

  // 2. Update Profile
  updateProfile: async (data: UpdateProfilePayload) => {
    const response = await api.put('/profile', data);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to update profile');
  },

  // 3. Address Management
  addAddress: async (data: AddressPayload) => {
    const response = await api.post('/profile/address', data);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to add address');
  },

  updateAddress: async (addressId: string, data: Partial<AddressPayload>) => {
    const response = await api.put(`/profile/address/${addressId}`, data);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to update address');
  },

  deleteAddress: async (addressId: string) => {
    const response = await api.delete(`/profile/address/${addressId}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to delete address');
  },

  // 4. Wishlist
  addToWishlist: async (productId: string) => {
    const response = await api.post(`/profile/wishlist/${productId}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to add to wishlist');
  },

  removeFromWishlist: async (productId: string) => {
    const response = await api.delete(`/profile/wishlist/${productId}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to remove from wishlist');
  },

  // 5. Cart (Backend Sync)
  addToCart: async (productId: string, quantity: number = 1) => {
    const response = await api.post('/profile/cart', { productId, quantity });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to add to cart');
  },

  updateCartItem: async (productId: string, quantity: number) => {
    const response = await api.put(`/profile/cart/${productId}`, { quantity });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to update cart');
  },

  removeFromCart: async (productId: string) => {
    const response = await api.delete(`/profile/cart/${productId}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to remove from cart');
  },

  clearCart: async () => {
    const response = await api.delete('/profile/cart');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to clear cart');
  }
};
