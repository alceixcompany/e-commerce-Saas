import api from '../api';
import { ComponentInstance } from '@/types/component';

export const componentService = {
  // 1. Fetch Component Instances
  fetchComponentInstances: async (type?: string) => {
    const url = type ? `/components?type=${type}` : '/components';
    const response = await api.get(url);
    if (response) return response.data.data;
    throw new Error('Failed to fetch component instances');
  },

  // 2. Fetch Single Component Instance
  fetchComponentInstanceById: async (id: string) => {
    const response = await api.get(`/components/${id}`);
    if (response) return response.data.data;
    throw new Error('Failed to fetch component instance');
  },

  // 3. Create Component Instance
  createComponentInstance: async (payload: { type: string, name: string, data?: any }) => {
    const response = await api.post('/components', payload);
    if (response) return response.data.data;
    throw new Error('Failed to create component instance');
  },

  // 4. Update Component Instance
  updateComponentInstance: async (id: string, data: any) => {
    // Backend expects { data: ... }
    const response = await api.put(`/components/${id}`, { data });
    if (response) return response.data.data;
    throw new Error('Failed to update component instance');
  },

  // 5. Delete Component Instance
  deleteComponentInstance: async (id: string) => {
    const response = await api.delete(`/components/${id}`);
    if (response) return id;
    throw new Error('Failed to delete component instance');
  }
};
