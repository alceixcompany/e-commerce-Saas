import { publicServerFetch, publicServerFetchEnvelope, shouldFailOnCriticalPublicDataError } from '../api';
import { Product } from '@/types/product';
import { normalizePaginatedResult, PaginatedResult } from '../serviceTypes';
import { buildTaggedFetchOptions } from '../cache';

const REVALIDATE_INTERVAL = 60; // seconds

interface ProductCategoryMetadata {
    totalProducts: number;
}

export const serverProductService = {
    /**
     * Fetch a single product by ID or Slug.
     * Uses 'no-store' cache so dynamic info like stock is always fresh.
     */
    getProductById: async (id: string, preview = false): Promise<Product | null> => {
        try {
            return await publicServerFetch<Product>(`/public/products/${id}`, {
                ...buildTaggedFetchOptions(['products', `product:${id}`], REVALIDATE_INTERVAL, preview)
            });
        } catch (error) {
            console.error(`[serverProductService] Failed to fetch product "${id}"`, error);
            return null;
        }
    },
    
    /**
     * Fetch products belonging to a specific category.
     * Uses ISR caching since category lists are rarely changed minute-by-minute.
     */
    getRelatedProducts: async (categoryId: string, excludeId?: string, limit: number = 5, preview = false): Promise<Product[]> => {
        if (!categoryId || categoryId === 'cat-demo') return [];
        
        try {
            const response = await publicServerFetchEnvelope<Product[]>(`/public/products?category=${categoryId}&limit=${limit}`, {
                ...buildTaggedFetchOptions(['products', `category:${categoryId}`], REVALIDATE_INTERVAL, preview)
            });
            let results = Array.isArray(response.data) ? response.data : [];
            if (excludeId) {
                results = results.filter(p => String(p._id) !== String(excludeId));
            }
            // Return max limit after filtering
            return results.slice(0, limit);
        } catch (error) {
            console.error('[serverProductService] Failed to fetch related products', error);
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
    } = {}, preview = false): Promise<PaginatedResult<Product, { limit: number }> & { categoryMetadata?: ProductCategoryMetadata }> => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== 'all') {
                queryParams.set(key, String(value));
            }
        });
        
        try {
            const response = await publicServerFetchEnvelope<Product[]>(
                `/public/products?${queryParams.toString()}`,
                buildTaggedFetchOptions(['products'], REVALIDATE_INTERVAL, preview)
            );
            return {
                ...normalizePaginatedResult(
                    {
                        data: Array.isArray(response.data) ? response.data : [],
                        total: typeof response.total === 'number' ? response.total : 0,
                        page: typeof response.page === 'number' ? response.page : 1,
                        pages: typeof response.pages === 'number' ? response.pages : 1,
                    },
                    { limit: Number(filters.limit) || 12 }
                ),
                ...(typeof response.totalProducts === 'number'
                    ? { categoryMetadata: { totalProducts: response.totalProducts } }
                    : {}),
            };
        } catch (error) {
            console.error('[serverProductService] Error fetching public products listing:', error);
            if (shouldFailOnCriticalPublicDataError()) throw error;
            return { 
                ...normalizePaginatedResult<Product, { limit: number }>(undefined, { limit: Number(filters.limit) || 12 }),
            };
        }
    },

    listPublicProductIds: async (): Promise<string[]> => {
        try {
            const response = await publicServerFetchEnvelope<Product[]>('/public/products?limit=1000', {
                ...buildTaggedFetchOptions(['products'], REVALIDATE_INTERVAL)
            });

            return (Array.isArray(response.data) ? response.data : [])
                .map((product) => product._id)
                .filter((id): id is string => typeof id === 'string' && id.length > 0);
        } catch (error) {
            console.error('[serverProductService] Error listing public product ids:', error);
            return [];
        }
    }
};
