import api from '../api';
import { Blog } from '@/types/blog';
import type { PaginationData } from '@/types/common';

export interface BlogListParams {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
}

export interface BlogAdminListParams {
  page?: number;
  limit?: number;
  q?: string;
}

export interface BlogListResponse {
  data: Blog[];
  metadata: PaginationData;
}

interface RawBlogListResponse {
  success: boolean;
  data: Blog[];
  total?: number;
  page?: number;
  pages?: number;
  message?: string;
}

interface RawBlogResponse {
  success: boolean;
  data: Blog;
  message?: string;
}

const normalizeBlogListResponse = (response: RawBlogListResponse, fallbackPage = 1): BlogListResponse => ({
  data: response.data || [],
  metadata: {
    total: response.total || 0,
    page: response.page || fallbackPage,
    pages: response.pages || 1,
  },
});

export const blogService = {
  // 1. Fetch Published Blogs (Public)
  fetchBlogs: async (params: BlogListParams = {}): Promise<BlogListResponse> => {
    const { page = 1, limit = 10, sort = '', q = '' } = params;
    const sortParam = sort ? `&sort=${sort}` : '';
    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';

    const response = await api.get<RawBlogListResponse>(`/blogs?page=${page}&limit=${limit}${sortParam}${qParam}`);
    if (response.data.success) return normalizeBlogListResponse(response.data, page);
    throw new Error(response.data.message || 'Failed to fetch blogs');
  },

  // 2. Fetch ALL Blogs (Admin)
  fetchAllBlogs: async (params: BlogAdminListParams = {}): Promise<BlogListResponse> => {
    const { page = 1, limit = 10, q = '' } = params;
    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';

    const response = await api.get<RawBlogListResponse>(`/blogs/all?page=${page}&limit=${limit}${qParam}`);
    if (response.data.success) return normalizeBlogListResponse(response.data, page);
    throw new Error(response.data.message || 'Failed to fetch admin blogs');
  },

  // 3. Fetch Single Blog
  fetchBlogBySlug: async (slugOrId: string): Promise<Blog> => {
    const response = await api.get<RawBlogResponse>(`/blogs/${slugOrId}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch blog');
  },

  // 4. Create Blog
  createBlog: async (blogData: Partial<Blog>): Promise<Blog> => {
    const response = await api.post<RawBlogResponse>('/blogs', blogData);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to create blog');
  },

  // 5. Update Blog
  updateBlog: async (id: string, data: Partial<Blog>): Promise<Blog> => {
    const response = await api.put<RawBlogResponse>(`/blogs/${id}`, data);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to update blog');
  },

  // Delete Blog
  deleteBlog: async (id: string) => {
    const response = await api.delete(`/blogs/${id}`);
    if (response.data.success) return id;
    throw new Error(response.data.message || 'Failed to delete blog');
  },

  // Bulk Delete Blogs
  bulkDeleteBlogs: async (ids: string[]) => {
    const response = await api.post('/blogs/bulk-delete', { ids });
    if (response.data.success) return ids;
    throw new Error(response.data.message || 'Failed to bulk delete blogs');
  }
};
