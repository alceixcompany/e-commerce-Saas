import { serverFetch } from '../api';
import { Product } from '@/types/product';

const REVALIDATE_INTERVAL = 60; // seconds

export const serverProductService = {
    /**
     * Fetch a single product by ID or Slug.
     * Uses 'no-store' cache so dynamic info like stock is always fresh.
     */
    getProductById: async (id: string): Promise<Product | null> => {
        try {
            return await serverFetch<Product>(`/public/products/${id}`, { cache: 'no-store' });
        } catch {
            return null;
        }
    },
    
    /**
     * Fetch products belonging to a specific category.
     * Uses ISR caching since category lists are rarely changed minute-by-minute.
     */
    getRelatedProducts: async (categoryId: string, excludeId?: string, limit: number = 5): Promise<Product[]> => {
        if (!categoryId || categoryId === 'cat-demo') return [];
        
        try {
            const data = await serverFetch<Product[]>(`/public/products?category=${categoryId}&limit=${limit}`, { 
                next: { revalidate: REVALIDATE_INTERVAL } 
            });
            // Ensure format is correct and filter the active product out
            let results = Array.isArray(data) ? data : [];
            if (excludeId) {
                results = results.filter(p => String(p._id) !== String(excludeId));
            }
            // Return max limit after filtering
            return results.slice(0, limit);
        } catch {
            return [];
        }
    },
    /**
     * Fetch products with query params filtering.
     * Often used for Listing pages.
     */
    getPublicProducts: async (filters: { 
        page?: number; 
        limit?: number; 
        category?: string; 
        sort?: string; 
        tag?: string; 
        q?: string 
    } = {}): Promise<{ 
        success: boolean; 
        data: Product[]; 
        metadata: { 
            total: number; 
            page: number; 
            limit: number; 
            pages: number 
        };
        categoryMetadata?: {
            totalProducts: number;
        }
    }> => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== 'all') {
                queryParams.set(key, String(value));
            }
        });
        
        try {
            return await serverFetch<{ 
                success: boolean; 
                data: Product[]; 
                metadata: { total: number; page: number; limit: number; pages: number };
                categoryMetadata?: { totalProducts: number };
            }>(`/public/products?${queryParams.toString()}`, { cache: 'no-store' });
        } catch (error) {
            console.error('[serverProductService] Error fetching public products listing:', error);
            return { 
                success: false, 
                data: [], 
                metadata: { total: 0, page: 1, limit: 12, pages: 1 }
            };
        }
    }
};
