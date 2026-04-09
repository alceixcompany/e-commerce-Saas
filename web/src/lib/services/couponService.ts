import api from '../api';
import { Coupon } from '@/types/coupon';

export const couponService = {
  // 1. Fetch Coupons (Admin)
  fetchCoupons: async (params: { page?: number; limit?: number } = {}) => {
    const { page = 1, limit = 10 } = params;
    const response = await api.get(`/coupons?page=${page}&limit=${limit}`);
    if (response.data.success) return response.data;
    throw new Error(response.data.message || 'Failed to fetch coupons');
  },

  // 2. Create Coupon
  createCoupon: async (couponData: any) => {
    const response = await api.post('/coupons', couponData);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to create coupon');
  },

  // 3. Delete Coupon
  deleteCoupon: async (id: string) => {
    const response = await api.delete(`/coupons/${id}`);
    if (response.data.success) return id;
    throw new Error(response.data.message || 'Failed to delete coupon');
  },

  // 4. Validate Coupon (Public/Checkout)
  validateCoupon: async (code: string, cartTotal: number) => {
    const response = await api.post('/coupons/validate', { code, cartTotal });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Coupon validation failed');
  }
};
