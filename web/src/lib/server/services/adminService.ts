import { serverFetch } from '../api';
import { AdminUser, DashboardStats, Message } from '@/types/admin';
import { Blog } from '@/types/blog';
import { PaginationData } from '@/types/common';
import { Coupon, CouponPayload } from '@/types/coupon';
import { PaymentSettings } from '@/types/payment-settings';
import { Product } from '@/types/product';
import { Order } from '@/types/order';
import { Category } from '@/types/category';
import { buildTaggedFetchOptions } from '../cache';

interface PaginationMetadata extends PaginationData {
    limit: number;
}

interface OrderStats {
    total: number;
    revenue: number;
    pending: number;
    preparing?: number;
    shipped?: number;
    delivered?: number;
    failed?: number;
}

interface PaginatedResponse<T> {
    data: T[];
    metadata: PaginationMetadata;
}

interface PaginatedOrderResponse extends PaginatedResponse<Order> {
    metadata: PaginationMetadata & {
        stats?: OrderStats;
    };
}

interface RawPaginatedResponse<T> {
    data?: T[];
    total?: number;
    page?: number;
    pages?: number;
    limit?: number;
    stats?: OrderStats;
}

interface DashboardPayload {
    stats?: DashboardStats;
}

interface AdminUserDetails extends AdminUser {
    addresses?: Array<{
        title?: string;
        fullAddress?: string;
        city?: string;
        district?: string;
        postalCode?: string;
        phone?: string;
        isDefault?: boolean;
    }>;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const ADMIN_REVALIDATE_INTERVAL = 15;

const normalizePaginatedResponse = <T>(
    payload: RawPaginatedResponse<T> | null | undefined,
    fallbackLimit = DEFAULT_LIMIT
): PaginatedResponse<T> => ({
    data: payload?.data ?? [],
    metadata: {
        total: payload?.total ?? 0,
        page: payload?.page ?? DEFAULT_PAGE,
        limit: payload?.limit ?? fallbackLimit,
        pages: payload?.pages ?? DEFAULT_PAGE,
    },
});

const normalizeOrderResponse = (
    payload: RawPaginatedResponse<Order> | null | undefined,
    fallbackLimit = DEFAULT_LIMIT
): PaginatedOrderResponse => ({
    ...normalizePaginatedResponse(payload, fallbackLimit),
    metadata: {
        ...normalizePaginatedResponse(payload, fallbackLimit).metadata,
        ...(payload?.stats ? { stats: payload.stats } : {}),
    },
});

const buildQueryString = (params: Record<string, string | number | undefined>, skipValues: string[] = ['all']) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined) return;
        if (typeof value === 'string' && (value === '' || skipValues.includes(value))) return;
        query.set(key, String(value));
    });

    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
};

const adminFetchOptions = (...tags: string[]) =>
    buildTaggedFetchOptions(['admin', ...tags], ADMIN_REVALIDATE_INTERVAL);

export const serverAdminService = {
    getDashboardStats: async (): Promise<DashboardStats | null> => {
        try {
            const payload = await serverFetch<DashboardPayload>('/admin/dashboard', adminFetchOptions('admin:dashboard'));
            return payload?.stats ?? null;
        } catch {
            return null;
        }
    },

    getAdminProducts: async (
        params: { page?: number; limit?: number; category?: string; q?: string } = {}
    ): Promise<PaginatedResponse<Product>> => {
        try {
            const payload = await serverFetch<RawPaginatedResponse<Product>>(
                `/products${buildQueryString(params)}`,
                adminFetchOptions('admin:products')
            );
            return normalizePaginatedResponse(payload, params.limit);
        } catch {
            return normalizePaginatedResponse<Product>(undefined, params.limit);
        }
    },

    getAdminOrders: async (
        params: { page?: number; limit?: number; status?: string; q?: string; filter?: string } = {}
    ): Promise<PaginatedOrderResponse> => {
        try {
            const payload = await serverFetch<RawPaginatedResponse<Order>>(
                `/orders${buildQueryString(params)}`,
                adminFetchOptions('admin:orders')
            );
            return normalizeOrderResponse(payload, params.limit);
        } catch {
            return normalizeOrderResponse(undefined, params.limit);
        }
    },

    getAdminUsers: async (params: { q?: string; sort?: string; role?: string } = {}): Promise<AdminUser[]> => {
        try {
            const payload = await serverFetch<RawPaginatedResponse<AdminUser>>(
                `/admin/users${buildQueryString(params, [])}`,
                adminFetchOptions('admin:users')
            );
            return payload.data ?? [];
        } catch {
            return [];
        }
    },

    getAdminBlogs: async (params: { q?: string } = {}): Promise<Blog[]> => {
        try {
            return await serverFetch<Blog[]>(`/blogs/all${buildQueryString(params, [])}`, adminFetchOptions('admin:blogs'));
        } catch {
            return [];
        }
    },

    // --- Write Operations (Delete) ---
    deleteProduct: async (id: string): Promise<void> => {
        await serverFetch(`/products/${id}`, { method: 'DELETE' });
    },

    deleteOrder: async (id: string): Promise<void> => {
        await serverFetch(`/orders/${id}`, { method: 'DELETE' });
    },

    deleteCategory: async (id: string): Promise<void> => {
        await serverFetch(`/categories/${id}`, { method: 'DELETE' });
    },

    deleteUser: async (id: string): Promise<void> => {
        await serverFetch(`/admin/users/${id}`, { method: 'DELETE' });
    },

    deleteBlog: async (id: string): Promise<void> => {
        await serverFetch(`/blogs/${id}`, { method: 'DELETE' });
    },

    // --- Write Operations (Create/Update) ---
    createProduct: async (data: FormData | string): Promise<Product> => {
        return await serverFetch<Product>('/products', {
            method: 'POST',
            body: data // Can be FormData or JSON string
        });
    },

    updateProduct: async (id: string, data: FormData | string): Promise<Product> => {
        return await serverFetch<Product>(`/products/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    createCategory: async (data: Partial<Category>): Promise<Category> => {
        return await serverFetch<Category>('/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
        return await serverFetch<Category>(`/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    createBlog: async (data: FormData | string): Promise<Blog> => {
        return await serverFetch<Blog>('/blogs', {
            method: 'POST',
            body: data // Usually FormData for images
        });
    },

    updateBlog: async (id: string, data: FormData | string): Promise<Blog> => {
        return await serverFetch<Blog>(`/blogs/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    updateUserRole: async (id: string, role: 'user' | 'admin'): Promise<AdminUser> => {
        return await serverFetch<AdminUser>(`/admin/users/${id}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
        });
    },

    // --- Coupons ---
    getCoupons: async (params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Coupon>> => {
        try {
            const payload = await serverFetch<RawPaginatedResponse<Coupon>>(
                `/coupons${buildQueryString(params, [])}`,
                adminFetchOptions('admin:coupons')
            );
            return normalizePaginatedResponse(payload, params.limit);
        } catch {
            return normalizePaginatedResponse<Coupon>(undefined, params.limit);
        }
    },

    // --- Messages ---
    getMessages: async (params: { page?: number; limit?: number } = {}): Promise<{ data: Message[] }> => {
        try {
            const messages = await serverFetch<Message[]>(`/contact${buildQueryString(params, [])}`, adminFetchOptions('admin:messages'));
            return { data: messages };
        } catch {
            return { data: [] };
        }
    },

    // --- Write Operations (Coupons/Messages) ---
    bulkDeleteCoupons: async (ids: string[]): Promise<void> => {
        await serverFetch('/coupons/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });
    },

    deleteMessage: async (id: string): Promise<void> => {
        await serverFetch(`/contact/${id}`, { method: 'DELETE' });
    },

    // --- Payment Settings ---
    getPaymentSettings: async (): Promise<PaymentSettings | null> => {
        try {
            return await serverFetch<PaymentSettings>('/admin/payment-settings', adminFetchOptions('admin:payment-settings'));
        } catch {
            return null;
        }
    },

    updatePaymentSettings: async (settings: PaymentSettings): Promise<void> => {
        await serverFetch('/admin/payment-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
    },

    getCategories: async (): Promise<Category[]> => {
        try {
            return await serverFetch<Category[]>('/public/categories', adminFetchOptions('admin:categories', 'categories'));
        } catch {
            return [];
        }
    },

    // --- Detail Fetches ---
    getAdminOrderById: async (id: string): Promise<Order | null> => {
        try {
            return await serverFetch<Order>(`/orders/${id}`, adminFetchOptions('admin:orders', `admin:order:${id}`));
        } catch {
            return null;
        }
    },

    getAdminUserById: async (id: string): Promise<AdminUserDetails | null> => {
        try {
            return await serverFetch<AdminUserDetails>(`/admin/users/${id}`, adminFetchOptions('admin:users', `admin:user:${id}`));
        } catch {
            return null;
        }
    },

    getAdminProductById: async (id: string): Promise<Product | null> => {
        try {
            return await serverFetch<Product>(`/products/${id}`, adminFetchOptions('admin:products', `admin:product:${id}`));
        } catch {
            return null;
        }
    },

    getAdminBlogById: async (id: string): Promise<Blog | null> => {
        try {
            return await serverFetch<Blog>(`/blogs/${id}`, adminFetchOptions('admin:blogs', `admin:blog:${id}`));
        } catch {
            return null;
        }
    }
};
