'use client';

import { create } from 'zustand';
import { Order, CreateOrderPayload, PaymentResult } from '@/types/order';
import { orderService } from '../services/orderService';

interface OrderMetadata {
    total: number;
    page: number;
    pages: number;
    stats?: any;
}

interface OrderState {
    orders: Order[];
    currentOrder: Order | null;
    metadata: OrderMetadata;
    isLoading: boolean;
    error: string | null;
    success: boolean;

    // Actions
    createOrder: (orderData: CreateOrderPayload) => Promise<Order>;
    payOrder: (orderId: string, paymentResult: PaymentResult) => Promise<Order>;
    fetchMyOrders: (params?: { page?: number; limit?: number }) => Promise<void>;
    fetchOrderById: (id: string) => Promise<void>;
    listOrders: (params?: { page?: number; limit?: number; filter?: string; q?: string }) => Promise<void>;
    deliverOrder: (orderId: string) => Promise<void>;
    deleteOrder: (orderId: string) => Promise<void>;
    bulkUpdateStatus: (orderIds: string[], status: string) => Promise<void>;
    bulkDeleteOrders: (orderIds: string[]) => Promise<void>;
    resetOrder: () => void;
    clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    currentOrder: null,
    metadata: { total: 0, page: 1, pages: 1 },
    isLoading: false,
    error: null,
    success: false,

    createOrder: async (orderData: CreateOrderPayload) => {
        set({ isLoading: true, error: null, success: false });
        try {
            const order = await orderService.createOrder(orderData);
            set({ currentOrder: order, success: true, isLoading: false });
            return order;
        } catch (error: any) {
            set({ error: error.message || 'Failed to create order', isLoading: false });
            throw error;
        }
    },

    payOrder: async (orderId, paymentResult) => {
        set({ isLoading: true, error: null });
        try {
            const order = await orderService.payOrder(orderId, paymentResult);
            set({ currentOrder: order, success: true, isLoading: false });
            return order;
        } catch (error: any) {
            set({ error: error.message || 'Payment failed', isLoading: false });
            throw error;
        }
    },

    fetchMyOrders: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await orderService.getMyOrders(params || {});
            set({ 
                orders: response.data, 
                metadata: { total: response.total, page: response.page, pages: response.pages },
                isLoading: false 
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch orders', isLoading: false });
        }
    },

    fetchOrderById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const order = await orderService.getOrderDetails(id);
            set({ currentOrder: order, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch order details', isLoading: false });
        }
    },

    listOrders: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await orderService.listOrders(params || {});
            set({ 
                orders: response.data, 
                metadata: { 
                    total: response.total, 
                    page: response.page, 
                    pages: response.pages,
                    stats: response.stats
                },
                isLoading: false 
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch admin orders', isLoading: false });
        }
    },

    deliverOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            const updatedOrder = await orderService.deliverOrder(orderId);
            set((state) => ({ 
                currentOrder: updatedOrder,
                orders: state.orders.map(o => o._id === orderId ? updatedOrder : o),
                isLoading: false 
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to update delivery status', isLoading: false });
        }
    },

    deleteOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            await orderService.deleteOrder(orderId);
            set((state) => ({ 
                orders: state.orders.filter(o => o._id !== orderId),
                isLoading: false 
            }));
        } catch (error: any) {
            set({ error: error.message || 'Delete failed', isLoading: false });
            throw error;
        }
    },

    bulkUpdateStatus: async (orderIds: string[], status: string) => {
        set({ isLoading: true, error: null });
        try {
            await orderService.bulkUpdateStatus(orderIds, status);
            set((state) => ({ 
                orders: state.orders.map(o => orderIds.includes(o._id) ? { ...o, status: status as any } : o),
                currentOrder: state.currentOrder && orderIds.includes(state.currentOrder._id) ? { ...state.currentOrder, status: status as any } : state.currentOrder,
                success: true,
                isLoading: false 
            }));
        } catch (error: any) {
            set({ error: error.message || 'Bulk update failed', isLoading: false });
            throw error;
        }
    },

    bulkDeleteOrders: async (orderIds: string[]) => {
        set({ isLoading: true, error: null });
        try {
            await orderService.bulkDeleteOrders(orderIds);
            set((state) => ({ 
                orders: state.orders.filter(o => !orderIds.includes(o._id)),
                currentOrder: state.currentOrder && orderIds.includes(state.currentOrder._id) ? null : state.currentOrder,
                success: true,
                isLoading: false 
            }));
        } catch (error: any) {
            set({ error: error.message || 'Bulk delete failed', isLoading: false });
            throw error;
        }
    },

    resetOrder: () => set({ currentOrder: null, success: false, error: null, isLoading: false }),
    clearError: () => set({ error: null })
}));
