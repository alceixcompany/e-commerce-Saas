import api from '../api';
import { Category } from '@/types/category';
import { fetchWithCache } from '../utils/apiCache';

const PUBLIC_CATEGORY_TTL_MINUTES = 5;
const clearPublicCategoryCache = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('alceix_cache_public_categories');
};

export const categoryService = {
  // 1. Fetch Categories (Admin)
  fetchCategories: async (params: { page?: number; limit?: number } = {}) => {
    const { page = 1, limit = 10 } = params;
    const response = await api.get(`/categories?page=${page}&limit=${limit}`);
    if (response.data.success) return response.data;
    throw new Error(response.data.message || 'Failed to fetch categories');
  },

  // 2. Fetch Public Categories (only active)
  fetchPublicCategories: async (forceRefresh: boolean = false) => {
    return await fetchWithCache(
      'public_categories',
      async () => {
        const response = await api.get(`/public/categories${forceRefresh ? '?refresh=true' : ''}`);
        if (response.data.success) return response.data;
        throw new Error(response.data.message || 'Failed to fetch public categories');
      },
      PUBLIC_CATEGORY_TTL_MINUTES,
      forceRefresh
    );
  },

  // 3. Fetch Single Category
  fetchCategory: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch category');
  },

  // 4. Create Category
  createCategory: async (categoryData: Partial<Category>) => {
    const response = await api.post('/categories', categoryData);
    if (response.data.success) {
      clearPublicCategoryCache();
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create category');
  },

  // 5. Update Category
  updateCategory: async (id: string, data: Partial<Category>) => {
    const response = await api.put(`/categories/${id}`, data);
    if (response.data.success) {
      clearPublicCategoryCache();
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update category');
  },

  // 6. Delete Category
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    if (response.data.success) {
      clearPublicCategoryCache();
      return id;
    }
    throw new Error(response.data.message || 'Failed to delete category');
  },

  // Bulk Delete Categories
  bulkDeleteCategories: async (ids: string[]) => {
    const response = await api.post('/categories/bulk-delete', { ids });
    if (response.data.success) {
      clearPublicCategoryCache();
      return ids;
    }
    throw new Error(response.data.message || 'Failed to bulk delete categories');
  }
};
