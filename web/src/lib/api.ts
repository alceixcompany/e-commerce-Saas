import axios from 'axios';
import { setToken, logout } from './slices/authSlice';

// Browser always talks to same-origin `/api` to avoid cross-site cookie issues in production.
const API_URL =
  typeof window !== 'undefined'
    ? '/api'
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api');
// Ensure baseURL ends with a trailing slash so that leading slashes in paths are handled correctly
const baseURL = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor: No longer needs to manually inject token as browser handles cookies
api.interceptors.request.use((config) => {
  return config;
});

// Fix localhost image URLs in production
api.interceptors.response.use((response) => {
  if (typeof window !== 'undefined' && response.data) {
    const fixImageUrl = (obj: any): any => {
      if (!obj) return obj;

      if (typeof obj === 'string' && (obj.includes('localhost:5001') || obj.includes('localhost:5000'))) {
        const productionBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://herra.onrender.com';
        return obj.replace(/http:\/\/localhost:500[01]/g, productionBase);
      }

      if (Array.isArray(obj)) {
        return obj.filter(item => item !== null && item !== undefined).map(fixImageUrl);
      }

      if (typeof obj === 'object') {
        const fixed: any = {};
        for (const key in obj) {
          fixed[key] = fixImageUrl(obj[key]);
        }
        return fixed;
      }

      return obj;
    };

    response.data = fixImageUrl(response.data);
  }
  return response;
}, async (error) => {
  const originalRequest = error.config;
  const skipAuthRedirect = !!originalRequest?.skipAuthRedirect;

  // If error is 401 or 403 and we haven't tried to refresh yet
  if (error.response && [401, 403].includes(error.response.status) && !originalRequest._retry) {
    // For 403, we only retry if it's the refresh token endpoint itself that's NOT being hit
    // because a 403 on the /refresh endpoint means the refresh token is dead.
    if (originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Attempt to refresh the token via HttpOnly Cookies
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, { 
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.data.success) {
        if (typeof window !== 'undefined') {
          const { store } = await import('./store');
          store.dispatch(setToken('verified')); 
        }
        return api(originalRequest);
      }
    } catch (refreshError) {
      // If refresh fails, only redirect if it's NOT a skipAuthRedirect case
      if (!skipAuthRedirect && typeof window !== 'undefined') {
        const { store } = await import('./store');
        store.dispatch(logout());
        
        // Only redirect to login IF the user was on a page that actually REQUIRES login
        // or if they were trying to access a clearly protected API
        const isAuthPage = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/profile') || window.location.pathname.startsWith('/checkout');
        
        if (isAuthPage) {
          window.location.href = `/login?expired=true&returnUrl=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }
  }

  return Promise.reject(error);
});

export default api;
