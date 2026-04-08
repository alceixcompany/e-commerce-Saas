import api from '../api';
import { Blog } from '@/types/blog';

export const blogService = {
  // 1. Fetch Published Blogs (Public)
  fetchBlogs: async (params: { page?: number; limit?: number; sort?: string; q?: string } = {}) => {
    const { page = 1, limit = 10, sort = '', q = '' } = params;
    const sortParam = sort ? `&sort=${sort}` : '';
    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';
    
    const response = await api.get(`/blogs?page=${page}&limit=${limit}${sortParam}${qParam}`);
    if (response) return response.data;
    throw new Error('Failed to fetch blogs');
  },

  // 2. Fetch ALL Blogs (Admin)
  fetchAllBlogs: async (params: { page?: number; limit?: number; q?: string } = {}) => {
    const { page = 1, limit = 10, q = '' } = params;
    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';
    
    const response = await api.get(`/blogs/all?page=${page}&limit=${limit}${qParam}`);
    if (response) return response.data;
    throw new Error('Failed to fetch admin blogs');
  },

  // 3. Fetch Single Blog
  fetchBlogBySlug: async (slugOrId: string) => {
    const response = await api.get(`/blogs/${slugOrId}`);
    if (response) return response.data;
    throw new Error('Failed to fetch blog');
  },

  // 4. Create Blog
  createBlog: async (blogData: Partial<Blog>) => {
    const response = await api.post('/blogs', blogData);
    if (response) return response.data;
    throw new Error('Failed to create blog');
  },

  // 5. Update Blog
  updateBlog: async (id: string, data: Partial<Blog>) => {
    const response = await api.put(`/blogs/${id}`, data);
    if (response) return response.data;
    throw new Error('Failed to update blog');
  },

  // 6. Delete Blog
  deleteBlog: async (id: string) => {
    const response = await api.delete(`/blogs/${id}`);
    if (response) return id;
    throw new Error('Failed to delete blog');
  }
};
