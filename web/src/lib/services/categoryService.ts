import api from '../api';
import { Category } from '@/types/category';
import { fetchWithCache } from '../utils/apiCache';
import type { PaginationData } from '@/types/common';

const PUBLIC_CATEGORY_TTL_MINUTES = 5;
const clearPublicCategoryCache = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('alceix_cache_public_categories');
};

export interface CategoryListParams {
  page?: number;
  limit?: number;
}

export interface CategoryListResponse {
  data: Category[];
  metadata: PaginationData & { totalProducts: number };
}

export interface PublicCategoryListResponse {
  data: Category[];
  totalProducts: number;
}

interface RawCategoryListResponse {
  success: boolean;
  data: Category[];
  total?: number;
  page?: number;
  pages?: number;
  totalProducts?: number;
  message?: string;
}

interface RawCategoryResponse {
  success: boolean;
  data: Category;
  message?: string;
}

const normalizeCategoryListResponse = (
  response: RawCategoryListResponse,
  fallbackPage: number
): CategoryListResponse => ({
  data: response.data || [],
  metadata: {
    total: response.total || 0,
    page: response.page || fallbackPage,
    pages: response.pages || 1,
    totalProducts: response.totalProducts || 0,
  },
});

export const categoryService = {
  // 1. Fetch Categories (Admin)
  fetchCategories: async (params: CategoryListParams = {}): Promise<CategoryListResponse> => {
    const { page = 1, limit = 10 } = params;
    const response = await api.get<RawCategoryListResponse>(`/categories?page=${page}&limit=${limit}`);
    if (response.data.success) return normalizeCategoryListResponse(response.data, page);
    throw new Error(response.data.message || 'Failed to fetch categories');
  },

  // 2. Fetch Public Categories (only active)
  fetchPublicCategories: async (forceRefresh: boolean = false): Promise<PublicCategoryListResponse> => {
    return await fetchWithCache(
      'public_categories',
      async () => {
        const response = await api.get<RawCategoryListResponse>(`/public/categories${forceRefresh ? '?refresh=true' : ''}`);
        if (response.data.success) {
          return {
            data: response.data.data || [],
            totalProducts: response.data.totalProducts || 0,
          };
        }
        throw new Error(response.data.message || 'Failed to fetch public categories');
      },
      PUBLIC_CATEGORY_TTL_MINUTES,
      forceRefresh
    );
  },

  // 3. Fetch Single Category
  fetchCategory: async (id: string): Promise<Category> => {
    const response = await api.get<RawCategoryResponse>(`/categories/${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch category');
  },

  // 4. Create Category
  createCategory: async (categoryData: Partial<Category>): Promise<Category> => {
    const response = await api.post<RawCategoryResponse>('/categories', categoryData);
    if (response.data.success) {
      clearPublicCategoryCache();
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create category');
  },

  // 5. Update Category
  updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put<RawCategoryResponse>(`/categories/${id}`, data);
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
