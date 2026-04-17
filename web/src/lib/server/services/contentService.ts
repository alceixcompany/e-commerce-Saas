import { serverFetch } from '../api';
import { CustomPage } from '@/types/page';
import { ProductSettings } from '@/types/content';

const REVALIDATE_INTERVAL = 60; // seconds

export const serverContentService = {

    getPageBySlug: async (slug: string): Promise<CustomPage | null> => {
        try {
            const response = await serverFetch<{ pageData: CustomPage }>(`/public/section-content/bootstrap?slug=${slug}`, {
                next: { revalidate: REVALIDATE_INTERVAL }
            });
            return response?.pageData || null;
        } catch {
            return null;
        }
    },

    getProductSettings: async (): Promise<ProductSettings | null> => {
        try {
            const response = await serverFetch<{ content: ProductSettings }>('/public/section-content/product_settings', {
                next: { revalidate: REVALIDATE_INTERVAL }
            });
            return response?.content || null;
        } catch {
            return null;
        }
    },
    
    getLegalSettings: async (type: string): Promise<{ title: string; content: string; lastUpdated?: string } | null> => {
        try {
            const response = await serverFetch<{ content: { title: string; content: string; lastUpdated?: string } }>(`/public/section-content/${type}`, {
                next: { revalidate: REVALIDATE_INTERVAL }
            });
            return response?.content || null;
        } catch {
            return null;
        }
    },

    getBootstrapData: async (slug?: string): Promise<any | null> => {
        try {
            const url = slug ? `/public/section-content/bootstrap?slug=${slug}` : '/public/section-content/bootstrap';
            const response = await serverFetch<any>(url, {
                // Using no-store for bootstrap because it manages critical state, 
                // but we could use revalidate if we want better performance.
                cache: 'no-store' 
            });
            return response || null;
        } catch {
            return null;
        }
    },

    getAuthSettings: async (): Promise<any | null> => {
        try {
            const response = await serverFetch<any>('/public/section-content/auth_settings', {
                next: { revalidate: REVALIDATE_INTERVAL }
            });
            return response?.content || null;
        } catch {
            return null;
        }
    }
};
