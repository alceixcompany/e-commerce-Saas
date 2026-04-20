import api from '../api';
import { Product } from '@/types/product';
import { fetchWithCache } from '../utils/apiCache';
import type { PaginationData } from '@/types/common';

const PRODUCT_STATS_TTL_MINUTES = 5;
const clearProductStatsCache = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('alceix_cache_product_stats');
};

export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
}

export interface PublicProductListParams {
  page?: number;
  limit?: number;
  tag?: string;
  category?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  minimal?: boolean;
  q?: string;
}

export interface ProductMutationPayload extends Partial<Product> {
  rating?: number;
}

export interface ProductSearchParams {
  query: string;
  page?: number;
  limit?: number;
  minimal?: boolean;
}

interface ProductListMetadata extends PaginationData {
  limit: number;
}

export interface ProductListResponse {
  data: Product[];
  metadata: ProductListMetadata;
}

export interface PublicProductListResponse extends ProductListResponse {
  categoryMetadata?: {
    totalProducts: number;
  };
}

interface RawProductListResponse {
  success: boolean;
  data: Product[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  totalProducts?: number;
  categoryMetadata?: {
    totalProducts?: number;
  };
  message?: string;
  warning?: boolean;
}

interface RawProductResponse {
  success: boolean;
  data: Product;
  message?: string;
  warning?: boolean;
}

const attachWarningFlag = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (error as { response?: { data?: { warning?: boolean } } }).response;
    if (response?.data?.warning) {
      (error as { warning?: boolean }).warning = true;
    }
  }

  return error;
};

const normalizeProductListResponse = (
  response: RawProductListResponse,
  fallbackPage: number,
  fallbackLimit: number
): PublicProductListResponse => ({
  data: response.data || [],
  metadata: {
    total: response.total || 0,
    page: response.page || fallbackPage,
    limit: response.limit || fallbackLimit,
    pages: response.pages || 1,
  },
  ...(response.categoryMetadata?.totalProducts !== undefined
    ? { categoryMetadata: { totalProducts: response.categoryMetadata.totalProducts } }
    : response.totalProducts !== undefined
      ? { categoryMetadata: { totalProducts: response.totalProducts } }
      : {}),
});

export const productService = {
  // 1. Fetch Products (Admin)
  fetchProducts: async (params: ProductListParams = {}): Promise<ProductListResponse> => {
    const { page = 1, limit = 10, category = '', q = '' } = params;
    const categoryParam = category ? `&category=${category}` : '';
    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';
    
    const response = await api.get<RawProductListResponse>(`/products?page=${page}&limit=${limit}${categoryParam}${qParam}`);
    if (response.data.success) return normalizeProductListResponse(response.data, page, limit);
    throw new Error(response.data.message || 'Failed to fetch products');
  },

  // 2. Fetch Public Products (Filtered/Search)
  fetchPublicProducts: async (params: PublicProductListParams = {}): Promise<PublicProductListResponse> => {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const tag = params.tag ? `&tag=${params.tag}` : '';
    const category = params.category && params.category !== 'all' ? `&category=${params.category}` : '';
    const sort = params.sort ? `&sort=${params.sort}` : '';
    const minPrice = params.minPrice ? `&minPrice=${params.minPrice}` : '';
    const maxPrice = params.maxPrice ? `&maxPrice=${params.maxPrice}` : '';
    const minimal = params.minimal ? `&minimal=true` : '';
    const q = params.q ? `&q=${encodeURIComponent(params.q)}` : '';

    const response = await api.get<RawProductListResponse>(`/public/products?page=${page}&limit=${limit}${tag}${category}${sort}${minPrice}${maxPrice}${minimal}${q}`);
    if (response.data.success) return normalizeProductListResponse(response.data, page, limit);
    throw new Error(response.data.message || 'Failed to fetch public products');
  },

  fetchPublicProductsPage: async (params: PublicProductListParams = {}): Promise<PublicProductListResponse> => {
    return await productService.fetchPublicProducts(params);
  },

  // 3. Fetch Single Product (Public)
  fetchProduct: async (id: string): Promise<Product> => {
    const response = await api.get<RawProductResponse>(`/public/products/${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch product');
  },

  // 4. Fetch Single Product (Admin)
  fetchProductAdmin: async (id: string): Promise<Product> => {
    const response = await api.get<RawProductResponse>(`/products/${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch product');
  },

  // 5. Create Product
  createProduct: async (productData: ProductMutationPayload): Promise<Product> => {
    try {
      const response = await api.post<RawProductResponse>('/products', productData);
      if (response.data.success) {
        clearProductStatsCache();
        return response.data.data;
      }
      const error = new Error(response.data.message || 'Failed to create product');
      if (response.data.warning) (error as any).warning = true;
      throw error;
    } catch (error) {
      throw attachWarningFlag(error);
    }
  },

  // 6. Update Product
  updateProduct: async (id: string, data: ProductMutationPayload): Promise<Product> => {
    try {
      const response = await api.put<RawProductResponse>(`/products/${id}`, data);
      if (response.data.success) {
        clearProductStatsCache();
        return response.data.data;
      }
      const error = new Error(response.data.message || 'Failed to update product');
      if (response.data.warning) (error as any).warning = true;
      throw error;
    } catch (error) {
      throw attachWarningFlag(error);
    }
  },

  // 7. Delete Product
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    if (response.data.success) {
      clearProductStatsCache();
      return id;
    }
    throw new Error(response.data.message || 'Failed to delete product');
  },

  // 8. Fetch Product Stats
  fetchProductStats: async () => {
    return await fetchWithCache(
      'product_stats',
      async () => {
        const response = await api.get('/public/products/stats');
        if (response.data.success) return response.data.data;
        throw new Error(response.data.message || 'Failed to fetch product stats');
      },
      PRODUCT_STATS_TTL_MINUTES
    );
  },

  // 9. Search Products
  searchProducts: async (params: ProductSearchParams): Promise<ProductListResponse> => {
    const { query, page = 1, limit = 10, minimal = true } = params;
    const minimalParam = minimal ? '&minimal=true' : '';
    const response = await api.get<RawProductListResponse>(`/public/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}${minimalParam}`);
    if (response.data.success) return normalizeProductListResponse(response.data, page, limit);
    throw new Error(response.data.message || 'Failed to search products');
  },

  // 10. Fetch Products By Ids
  fetchProductsByIds: async (ids: string[]) => {
    if (!ids || ids.length === 0) return [];
    const response = await api.get(`/public/products/ids?ids=${ids.join(',')}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch products');
  },

  // 11. Bulk Delete Products
  bulkDeleteProducts: async (ids: string[]) => {
    const response = await api.post('/products/bulk-delete', { ids });
    if (response.data.success) {
      clearProductStatsCache();
      return ids;
    }
    throw new Error(response.data.message || 'Failed to bulk delete products');
  }
};
