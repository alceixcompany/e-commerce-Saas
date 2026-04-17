import { serverFetch } from '../api';
import { Order } from '@/types/order';

export const serverOrderService = {
  /**
   * Fetch a single order for the current authenticated user.
   */
  getUserOrderById: async (id: string): Promise<Order | null> => {
    try {
      return await serverFetch<Order>(`/orders/${id}`, { cache: 'no-store' });
    } catch (error) {
      console.error(`[serverOrderService] Error fetching order ${id}:`, error);
      return null;
    }
  }
};
