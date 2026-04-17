import { serverFetch } from '../api';
import { Product } from '@/types/product';
import { Order } from '@/types/order';
import { Category } from '@/types/category';

export const serverAdminService = {
    getDashboardStats: async (): Promise<any | null> => {
        try {
            return await serverFetch<any>('/admin/dashboard/stats', { cache: 'no-store' });
        } catch {
            return null;
        }
    },

    getAdminProducts: async (params: { page?: number; limit?: number; category?: string; q?: string } = {}): Promise<any> => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== 'all') query.set(key, String(value));
        });
        
        try {
            return await serverFetch<any>(`/admin/products?${query.toString()}`, { cache: 'no-store' });
        } catch {
            return { data: [], metadata: { total: 0, page: 1, limit: 10, pages: 1 } };
        }
    },

    getAdminOrders: async (params: { page?: number; limit?: number; status?: string; q?: string } = {}): Promise<any> => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== 'all') query.set(key, String(value));
        });

        try {
            return await serverFetch<any>(`/admin/orders?${query.toString()}`, { cache: 'no-store' });
        } catch {
            return { data: [], metadata: { total: 0, page: 1, limit: 10, pages: 1 } };
        }
    },

    getAdminUsers: async (params: { q?: string; sort?: string; role?: string } = {}): Promise<any[]> => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') query.set(key, String(value));
        });

        try {
            return await serverFetch<any[]>(`/admin/users?${query.toString()}`, { cache: 'no-store' });
        } catch {
            return [];
        }
    },

    getAdminBlogs: async (params: { q?: string } = {}): Promise<any[]> => {
        const query = new URLSearchParams();
        if (params.q) query.set('q', params.q);

        try {
            return await serverFetch<any[]>(`/admin/journal?${query.toString()}`, { cache: 'no-store' });
        } catch {
            return [];
        }
    },

    // --- Write Operations (Delete) ---
    deleteProduct: async (id: string): Promise<void> => {
        await serverFetch(`/admin/products/${id}`, { method: 'DELETE' });
    },

    deleteOrder: async (id: string): Promise<void> => {
        await serverFetch(`/admin/orders/${id}`, { method: 'DELETE' });
    },

    deleteCategory: async (id: string): Promise<void> => {
        await serverFetch(`/admin/categories/${id}`, { method: 'DELETE' });
    },

    deleteUser: async (id: string): Promise<void> => {
        await serverFetch(`/admin/users/${id}`, { method: 'DELETE' });
    },

    deleteBlog: async (id: string): Promise<void> => {
        await serverFetch(`/admin/journal/${id}`, { method: 'DELETE' });
    },

    // --- Write Operations (Create/Update) ---
    createProduct: async (data: any): Promise<any> => {
        return await serverFetch('/admin/products', {
            method: 'POST',
            body: data // Can be FormData or JSON string
        });
    },

    updateProduct: async (id: string, data: any): Promise<any> => {
        return await serverFetch(`/admin/products/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    createCategory: async (data: any): Promise<any> => {
        return await serverFetch('/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    updateCategory: async (id: string, data: any): Promise<any> => {
        return await serverFetch(`/admin/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    createBlog: async (data: any): Promise<any> => {
        return await serverFetch('/admin/journal', {
            method: 'POST',
            body: data // Usually FormData for images
        });
    },

    updateBlog: async (id: string, data: any): Promise<any> => {
        return await serverFetch(`/admin/journal/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    updateUserRole: async (id: string, role: string): Promise<any> => {
        return await serverFetch(`/admin/users/${id}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
        });
    },

    // --- Coupons ---
    getCoupons: async (params: { page?: number; limit?: number } = {}): Promise<any> => {
        const query = new URLSearchParams();
        if (params.page) query.set('page', String(params.page));
        if (params.limit) query.set('limit', String(params.limit));

        try {
            return await serverFetch<any>(`/admin/coupons?${query.toString()}`, { cache: 'no-store' });
        } catch {
            return { data: [], metadata: { total: 0, page: 1, limit: 10, pages: 1 } };
        }
    },

    // --- Messages ---
    getMessages: async (params: { page?: number; limit?: number } = {}): Promise<any> => {
        const query = new URLSearchParams();
        if (params.page) query.set('page', String(params.page));
        if (params.limit) query.set('limit', String(params.limit));

        try {
            return await serverFetch<any>(`/admin/messages?${query.toString()}`, { cache: 'no-store' });
        } catch {
            return { data: [], metadata: { total: 0, page: 1, limit: 10, pages: 1 } };
        }
    },

    // --- Write Operations (Coupons/Messages) ---
    bulkDeleteCoupons: async (ids: string[]): Promise<void> => {
        await serverFetch('/admin/coupons/bulk', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });
    },

    deleteMessage: async (id: string): Promise<void> => {
        await serverFetch(`/admin/messages/${id}`, { method: 'DELETE' });
    },

    // --- Payment Settings ---
    getPaymentSettings: async (): Promise<any> => {
        try {
            return await serverFetch<any>('/admin/settings/payment', { cache: 'no-store' });
        } catch {
            return null;
        }
    },

    updatePaymentSettings: async (settings: any): Promise<void> => {
        await serverFetch('/admin/settings/payment', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
    },

    getCategories: async (): Promise<Category[]> => {
        try {
            return await serverFetch<Category[]>('/public/categories', { next: { revalidate: 60 } });
        } catch {
            return [];
        }
    },

    // --- Detail Fetches ---
    getAdminOrderById: async (id: string): Promise<Order | null> => {
        try {
            return await serverFetch<Order>(`/admin/orders/${id}`, { cache: 'no-store' });
        } catch {
            return null;
        }
    },

    getAdminUserById: async (id: string): Promise<any | null> => {
        try {
            return await serverFetch<any>(`/admin/users/${id}`, { cache: 'no-store' });
        } catch {
            return null;
        }
    },

    getAdminProductById: async (id: string): Promise<Product | null> => {
        try {
            return await serverFetch<Product>(`/admin/products/${id}`, { cache: 'no-store' });
        } catch {
            return null;
        }
    },

    getAdminBlogById: async (id: string): Promise<any | null> => {
        try {
            return await serverFetch<any>(`/admin/journal/${id}`, { cache: 'no-store' });
        } catch {
            return null;
        }
    }
};
