import api from '../api';

export const adminService = {
  // 1. Fetch Dashboard Stats
  fetchDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    if (response.data.success) return response.data.data.stats;
    throw new Error(response.data.message || 'Failed to fetch dashboard stats');
  },

  // 2. User Management
  fetchUsers: async (params: { page?: number; limit?: number; q?: string; sort?: string; role?: string } = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const q = params.q ? `&q=${encodeURIComponent(params.q)}` : '';
    const sort = params.sort ? `&sort=${params.sort}` : '';
    const role = params.role ? `&role=${params.role}` : '';
    
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}${q}${sort}${role}`);
    if (response.data.success) return response.data;
    throw new Error(response.data.message || 'Failed to fetch users');
  },

  fetchUserDetails: async (userId: string, params: { page?: number; limit?: number } = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const response = await api.get(`/admin/users/${userId}?page=${page}&limit=${limit}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch user details');
  },

  updateUserRole: async (userId: string, role: 'user' | 'admin') => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to update user role');
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    if (response.data.success) return userId;
    throw new Error(response.data.message || 'Failed to delete user');
  },

  bulkDeleteUsers: async (ids: string[]) => {
    const response = await api.post('/admin/users/bulk-delete', { ids });
    if (response.data.success) return ids;
    throw new Error(response.data.message || 'Failed to bulk delete users');
  },

  // 3. Message Management
  fetchMessages: async () => {
    const response = await api.get('/contact');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch messages');
  }
};
