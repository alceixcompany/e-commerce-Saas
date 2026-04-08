import api from '../api';
import { CustomPage } from '@/types/page';

export const pageService = {
  // 1. Fetch All Pages
  fetchPages: async () => {
    const response = await api.get('/pages');
    if (response) return response.data.data;
    throw new Error('Failed to fetch pages');
  },

  // 2. Fetch Single Page by Slug
  fetchPageBySlug: async (slug: string) => {
    const response = await api.get(`/pages/${slug}`);
    if (response) return response.data.data;
    throw new Error('Failed to fetch page');
  },

  // 3. Create Page
  createPage: async (pageData: Partial<CustomPage>) => {
    const response = await api.post('/pages', pageData);
    if (response) return response.data.data;
    throw new Error('Failed to create page');
  },

  // 4. Update Page
  updatePage: async (id: string, data: Partial<CustomPage>) => {
    const response = await api.put(`/pages/${id}`, data);
    if (response) return response.data.data;
    throw new Error('Failed to update page');
  },

  // 5. Delete Page
  deletePage: async (id: string) => {
    const response = await api.delete(`/pages/${id}`);
    if (response) return id;
    throw new Error('Failed to delete page');
  }
};
