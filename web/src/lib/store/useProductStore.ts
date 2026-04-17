'use client';

import { create } from 'zustand';
import { Product } from '@/types/product';
import { productService } from '../services/productService';

interface ProductMetadata {
    total: number;
    page: number;
    pages: number;
}

interface ProductState {
    products: Product[];
    currentProduct: Product | null;
    metadata: ProductMetadata;
    isLoading: {
        list: boolean;
        single: boolean;
        action: boolean;
    };
    error: string | null;

    // Search results
    searchResults: Product[];
    searchMetadata: ProductMetadata;
    stats: { newArrivals: number; bestSellers: number };

    // Actions
    fetchProducts: (params?: any) => Promise<void>;
    fetchProductById: (id: string, isAdmin?: boolean) => Promise<void>;
    searchProducts: (params: { query: string; page?: number; limit?: number }) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    bulkDeleteProducts: (ids: string[]) => Promise<void>;
    createProduct: (data: any) => Promise<Product>;
    updateProduct: (id: string, data: any) => Promise<Product>;
    fetchPublicProducts: (params?: any) => Promise<void>;
    fetchProductsByIds: (ids: string[]) => Promise<Product[]>;
    setCurrentProduct: (product: Product | null) => void;
    clearSearchResults: () => void;
    resetProducts: () => void;
    fetchProductStats: () => Promise<void>;
    clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    currentProduct: null,
    metadata: { total: 0, page: 1, pages: 1 },
    isLoading: {
        list: false,
        single: false,
        action: false,
    },
    error: null,
    searchResults: [],
    searchMetadata: { total: 0, page: 1, pages: 1 },
    stats: { newArrivals: 0, bestSellers: 0 },

    fetchProducts: async (params) => {
        set((state) => ({ isLoading: { ...state.isLoading, list: true }, error: null }));
        try {
            const response = await productService.fetchProducts(params);
            set({ 
                products: response.data, 
                metadata: { total: response.total, page: response.page, pages: response.pages },
                isLoading: { ...get().isLoading, list: false }
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch products', isLoading: { ...get().isLoading, list: false } });
        }
    },

    fetchProductById: async (id, isAdmin = false) => {
        set((state) => ({ isLoading: { ...state.isLoading, single: true }, error: null }));
        try {
            const product = isAdmin 
                ? await productService.fetchProductAdmin(id)
                : await productService.fetchProduct(id);
            set({ 
                currentProduct: product, 
                isLoading: { ...get().isLoading, single: false } 
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch product', isLoading: { ...get().isLoading, single: false } });
        }
    },

    searchProducts: async (params) => {
        set((state) => ({ isLoading: { ...state.isLoading, list: true }, error: null }));
        try {
            const response = await productService.searchProducts(params);
            set({ 
                searchResults: response.data, 
                searchMetadata: { total: response.total, page: response.page, pages: response.pages },
                isLoading: { ...get().isLoading, list: false }
            });
        } catch (error: any) {
            set({ error: error.message || 'Search failed', isLoading: { ...get().isLoading, list: false } });
        }
    },

    deleteProduct: async (id) => {
        set((state) => ({ isLoading: { ...state.isLoading, action: true }, error: null }));
        try {
            await productService.deleteProduct(id);
            set((state) => ({ 
                products: state.products.filter(p => p._id !== id),
                isLoading: { ...state.isLoading, action: false } 
            }));
        } catch (error: any) {
            set({ error: error.message || 'Delete failed', isLoading: { ...get().isLoading, action: false } });
            throw error;
        }
    },

    bulkDeleteProducts: async (ids) => {
        set((state) => ({ isLoading: { ...state.isLoading, action: true }, error: null }));
        try {
            await productService.bulkDeleteProducts(ids);
            set((state) => ({ 
                products: state.products.filter(p => !ids.includes(p._id)),
                isLoading: { ...state.isLoading, action: false } 
            }));
        } catch (error: any) {
            set({ error: error.message || 'Bulk delete failed', isLoading: { ...get().isLoading, action: false } });
            throw error;
        }
    },

    createProduct: async (data: any) => {
        set((state) => ({ isLoading: { ...state.isLoading, action: true }, error: null }));
        try {
            const product = await productService.createProduct(data);
            set((state) => ({ 
                products: [product, ...state.products],
                isLoading: { ...state.isLoading, action: false } 
            }));
            return product;
        } catch (error: any) {
            set({ error: error.message || 'Create failed', isLoading: { ...get().isLoading, action: false } });
            throw error;
        }
    },

    updateProduct: async (id: string, data: any) => {
        set((state) => ({ isLoading: { ...state.isLoading, action: true }, error: null }));
        try {
            const product = await productService.updateProduct(id, data);
            set((state) => ({ 
                products: state.products.map(p => p._id === id ? product : p),
                currentProduct: state.currentProduct?._id === id ? product : state.currentProduct,
                isLoading: { ...state.isLoading, action: false } 
            }));
            return product;
        } catch (error: any) {
            set({ error: error.message || 'Update failed', isLoading: { ...get().isLoading, action: false } });
            throw error;
        }
    },

    fetchPublicProducts: async (params: any) => {
        set((state) => ({ isLoading: { ...state.isLoading, list: true }, error: null }));
        try {
            const response = await productService.fetchPublicProducts(params);
            set({ 
                products: response.data, 
                metadata: { total: response.total, page: response.page, pages: response.pages },
                isLoading: { ...get().isLoading, list: false }
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch public products', isLoading: { ...get().isLoading, list: false } });
        }
    },

    fetchProductsByIds: async (ids: string[]) => {
        set((state) => ({ isLoading: { ...state.isLoading, list: true }, error: null }));
        try {
            const products = await productService.fetchProductsByIds(ids);
            // Don't override products state, just return it for custom components
            set({ isLoading: { ...get().isLoading, list: false } });
            return products;
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch products by ids', isLoading: { ...get().isLoading, list: false } });
            return [];
        }
    },

    setCurrentProduct: (product) => set({ currentProduct: product }),
    clearSearchResults: () => set({ searchResults: [], searchMetadata: { total: 0, page: 1, pages: 1 } }),
    resetProducts: () => set({ products: [], metadata: { total: 0, page: 1, pages: 1 } }),
    fetchProductStats: async () => {
        // Implement logic to fetch counts if needed, or just keep default 0 for now
        // This is mainly for UI count display in PopularCollections
    },
    clearError: () => set({ error: null })
}));
