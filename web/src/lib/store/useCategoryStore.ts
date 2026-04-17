'use client';

import { create } from 'zustand';
import { Category } from '@/types/category';
import { categoryService } from '../services/categoryService';

interface CategoryMetadata {
    total: number;
    page: number;
    pages: number;
    totalProducts: number;
}

interface CategoryState {
    categories: Category[];
    currentCategory: Category | null;
    metadata: CategoryMetadata;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchCategories: (params?: { page?: number; limit?: number }) => Promise<void>;
    fetchPublicCategories: (forceRefresh?: boolean) => Promise<void>;
    fetchCategoryById: (id: string) => Promise<void>;
    createCategory: (data: Partial<Category>) => Promise<Category>;
    updateCategory: (id: string, data: Partial<Category>) => Promise<Category>;
    deleteCategory: (id: string) => Promise<void>;
    clearError: () => void;
    setCurrentCategory: (category: Category | null) => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    currentCategory: null,
    metadata: { total: 0, page: 1, pages: 1, totalProducts: 0 },
    isLoading: false,
    error: null,

    fetchCategories: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await categoryService.fetchCategories(params || {});
            set({ 
                categories: response.data, 
                metadata: { 
                    total: response.total, 
                    page: response.page, 
                    pages: response.pages,
                    totalProducts: response.totalProducts
                },
                isLoading: false 
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch categories', isLoading: false });
        }
    },

    fetchPublicCategories: async (forceRefresh) => {
        set({ isLoading: true, error: null });
        try {
            const response = await categoryService.fetchPublicCategories(forceRefresh);
            set({ 
                categories: response.data, 
                metadata: { ...get().metadata, totalProducts: response.totalProducts },
                isLoading: false 
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch public categories', isLoading: false });
        }
    },

    fetchCategoryById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const category = await categoryService.fetchCategory(id);
            set({ currentCategory: category, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch category', isLoading: false });
        }
    },

    createCategory: async (data: Partial<Category>) => {
        set({ isLoading: true, error: null });
        try {
            const newCategory = await categoryService.createCategory(data);
            set((state) => ({ 
                categories: [newCategory, ...state.categories],
                isLoading: false 
            }));
            return newCategory;
        } catch (error: any) {
            set({ error: error.message || 'Create failed', isLoading: false });
            throw error;
        }
    },

    updateCategory: async (id: string, data: Partial<Category>) => {
        set({ isLoading: true, error: null });
        try {
            const updatedCategory = await categoryService.updateCategory(id, data);
            set((state) => ({ 
                categories: state.categories.map(c => c._id === id ? updatedCategory : c),
                isLoading: false 
            }));
            return updatedCategory;
        } catch (error: any) {
            set({ error: error.message || 'Update failed', isLoading: false });
            throw error;
        }
    },

    deleteCategory: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await categoryService.deleteCategory(id);
            set((state) => ({ 
                categories: state.categories.filter(c => c._id !== id),
                isLoading: false 
            }));
        } catch (error: any) {
            set({ error: error.message || 'Delete failed', isLoading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
    setCurrentCategory: (category) => set({ currentCategory: category })
}));
