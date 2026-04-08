import api from '../api';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

export const authService = {
  // 1. Regular Login
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Login failed');
  },

  // 2. Regular Registration
  register: async (credentials: RegisterCredentials) => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Registration failed');
  },

  // 3. Google OAuth Login
  googleLogin: async (token: string) => {
    const response = await api.post<AuthResponse>('/auth/google', { token });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Google login failed');
  },

  // 4. Logout
  logout: async () => {
    await api.post('/auth/logout');
  }
};
