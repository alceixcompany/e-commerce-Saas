import { create } from 'zustand';
import { Coupon, CouponPayload } from '@/types/coupon';
import { couponService } from '../services/couponService';

interface CouponState {
    coupons: Coupon[];
    metadata: {
        total: number;
        page: number;
        pages: number;
    };
    isLoading: Record<string, boolean>;
    error: string | null;

    // Actions
    fetchCoupons: (params?: { page?: number; limit?: number }) => Promise<any>;
    createCoupon: (payload: CouponPayload) => Promise<Coupon>;
    deleteCoupon: (id: string) => Promise<string>;
    bulkDeleteCoupons: (ids: string[]) => Promise<string[]>;
    clearError: () => void;
}

export const useCouponStore = create<CouponState>((set, get) => ({
    coupons: [],
    metadata: { total: 0, page: 1, pages: 1 },
    isLoading: {},
    error: null,

    fetchCoupons: async (params) => {
        set((state) => ({ isLoading: { ...state.isLoading, fetchList: true }, error: null }));
        try {
            const response = await couponService.fetchCoupons(params || {});
            const { data, total, page, pages } = response;
            set((state) => ({ 
                coupons: data, 
                metadata: { total, page, pages },
                isLoading: { ...state.isLoading, fetchList: false } 
            }));
            return response;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch coupons';
            set((state) => ({ error: message, isLoading: { ...state.isLoading, fetchList: false } }));
            throw error;
        }
    },

    createCoupon: async (payload) => {
        set((state) => ({ isLoading: { ...state.isLoading, create: true }, error: null }));
        try {
            const newCoupon = await couponService.createCoupon(payload);
            set((state) => ({ 
                coupons: [newCoupon, ...state.coupons],
                isLoading: { ...state.isLoading, create: false } 
            }));
            return newCoupon;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to create coupon';
            set((state) => ({ error: message, isLoading: { ...state.isLoading, create: false } }));
            throw error;
        }
    },

    deleteCoupon: async (id) => {
        set((state) => ({ isLoading: { ...state.isLoading, delete: true }, error: null }));
        try {
            await couponService.deleteCoupon(id);
            set((state) => ({
                coupons: state.coupons.filter(c => c._id !== id),
                isLoading: { ...state.isLoading, delete: false }
            }));
            return id;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to delete coupon';
            set((state) => ({ error: message, isLoading: { ...state.isLoading, delete: false } }));
            throw error;
        }
    },

    bulkDeleteCoupons: async (ids) => {
        set((state) => ({ isLoading: { ...state.isLoading, delete: true }, error: null }));
        try {
            await couponService.bulkDeleteCoupons(ids);
            set((state) => ({
                coupons: state.coupons.filter(c => !ids.includes(c._id)),
                isLoading: { ...state.isLoading, delete: false }
            }));
            return ids;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to bulk delete coupons';
            set((state) => ({ error: message, isLoading: { ...state.isLoading, delete: false } }));
            throw error;
        }
    },

    clearError: () => set({ error: null })
}));
