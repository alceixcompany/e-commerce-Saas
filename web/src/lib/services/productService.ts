import api from '../api';
import { Product } from '@/types/product';

export const productService = {
  // 1. Fetch Products (Admin)
  fetchProducts: async (params: { page?: number; limit?: number; category?: string; q?: string } = {}) => {
    const { page = 1, limit = 10, category = '', q = '' } = params;
    const categoryParam = category ? `&category=${category}` : '';
    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';
    
    const response = await api.get(`/products?page=${page}&limit=${limit}${categoryParam}${qParam}`);
    if (response.data.success) return response.data;
    throw new Error(response.data.message || 'Failed to fetch products');
  },

  // 2. Fetch Public Products (Filtered/Search)
  fetchPublicProducts: async (params: {
    page?: number;
    limit?: number;
    tag?: string;
    category?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    minimal?: boolean;
    q?: string;
  } = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const tag = params.tag ? `&tag=${params.tag}` : '';
    const category = params.category && params.category !== 'all' ? `&category=${params.category}` : '';
    const sort = params.sort ? `&sort=${params.sort}` : '';
    const minPrice = params.minPrice ? `&minPrice=${params.minPrice}` : '';
    const maxPrice = params.maxPrice ? `&maxPrice=${params.maxPrice}` : '';
    const minimal = params.minimal ? `&minimal=true` : '';
    const q = params.q ? `&q=${encodeURIComponent(params.q)}` : '';

    const response = await api.get(`/public/products?page=${page}&limit=${limit}${tag}${category}${sort}${minPrice}${maxPrice}${minimal}${q}`);
    if (response.data.success) return response.data;
    throw new Error(response.data.message || 'Failed to fetch public products');
  },

  // 3. Fetch Single Product (Public)
  fetchProduct: async (id: string) => {
    const response = await api.get(`/public/products/${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch product');
  },

  // 4. Fetch Single Product (Admin)
  fetchProductAdmin: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch product');
  },

  // 5. Create Product
  createProduct: async (productData: Partial<Product>) => {
    const response = await api.post('/products', productData);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to create product');
  },

  // 6. Update Product
  updateProduct: async (id: string, data: Partial<Product>) => {
    const response = await api.put(`/products/${id}`, data);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to update product');
  },

  // 7. Delete Product
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    if (response.data.success) return id;
    throw new Error(response.data.message || 'Failed to delete product');
  },

  // 8. Fetch Product Stats
  fetchProductStats: async () => {
    const response = await api.get('/public/products/stats');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch product stats');
  },

  // 9. Search Products
  searchProducts: async (params: { query: string; page?: number; limit?: number; minimal?: boolean }) => {
    const { query, page = 1, limit = 10, minimal = true } = params;
    const minimalParam = minimal ? '&minimal=true' : '';
    const response = await api.get(`/public/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}${minimalParam}`);
    if (response.data.success) return response.data;
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
    if (response.data.success) return ids;
    throw new Error(response.data.message || 'Failed to bulk delete products');
  }
};
