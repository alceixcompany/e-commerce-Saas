import api from '../api';
import {  CreateOrderPayload, PaymentResult } from '@/types/order';

export const orderService = {
  // 1. Create Order
  createOrder: async (orderData: CreateOrderPayload) => {
    const response = await api.post('/orders', orderData);
    if (response) return response.data.data;
    throw new Error('Failed to create order');
  },

  // 2. Pay Order
  payOrder: async (orderId: string, paymentResult: PaymentResult) => {
    const response = await api.put(`/orders/${orderId}/pay`, paymentResult);
    if (response) return response.data.data;
    throw new Error('Failed to pay order');
  },

  // 3. Get User Orders
  getMyOrders: async (params: { page?: number; limit?: number } = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const response = await api.get(`/orders/myorders?page=${page}&limit=${limit}`);
    if (response) return response.data;
    throw new Error('Failed to fetch my orders');
  },

  // 4. List Orders (Admin)
  listOrders: async (params: { page?: number; limit?: number; filter?: string; q?: string } = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const filter = params.filter ? `&filter=${params.filter}` : '';
    const q = params.q ? `&q=${encodeURIComponent(params.q)}` : '';
    
    const response = await api.get(`/orders?page=${page}&limit=${limit}${filter}${q}`);
    if (response) return response.data;
    throw new Error('Failed to list orders');
  },

  // 5. Deliver Order (Admin)
  deliverOrder: async (orderId: string) => {
    const response = await api.put(`/orders/${orderId}/deliver`, {});
    if (response) return response.data.data;
    throw new Error('Failed to deliver order');
  },

  // 6. Get Order Details
  getOrderDetails: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    if (response) return response.data.data;
    throw new Error('Failed to fetch order details');
  },

  // 7. Delete Order (Admin)
  deleteOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    if (response) return id;
    throw new Error('Failed to delete order');
  },

  // 8. Bulk Update Status (Admin)
  bulkUpdateStatus: async (orderIds: string[], status: string) => {
    const response = await api.put('/orders/bulk-status', { orderIds, status });
    if (response) return response.data;
    throw new Error('Failed to update orders');
  },

  // 9. Bulk Delete Orders (Admin)
  bulkDeleteOrders: async (orderIds: string[]) => {
    const response = await api.post('/orders/bulk-delete', { orderIds });
    if (response) return orderIds;
    throw new Error('Failed to delete orders');
  }
};
