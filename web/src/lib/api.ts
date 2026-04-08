import axios from 'axios';
import { setToken, logout } from './slices/authSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
// Ensure baseURL ends with a trailing slash so that leading slashes in paths are handled correctly
const baseURL = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
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

  // If error is 401 and we haven't tried to refresh yet
  if (error.response && error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      // Attempt to refresh the token via HttpOnly Cookies
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
      
      if (response.data.success) {
        // Sync Redux Store (Dynamic import to avoid circular dependency)
        if (typeof window !== 'undefined') {
          const { store } = await import('./store');
          // Since the token is in HttpOnly cookie, we just inform Redux that we are authenticated
          store.dispatch(setToken('verified')); 
        }

        // Retry the original request (browser will now have the new accessToken cookie)
        return api(originalRequest);
      }
    } catch (refreshError) {
      // If refresh fails, log out
      if (typeof window !== 'undefined') {
        const { store } = await import('./store');
        store.dispatch(logout());
        window.location.href = '/login';
      }
    }
  }

  // Handle other 401 cases or refresh failures
  if (error.response && error.response.status === 401) {
    if (typeof window !== 'undefined') {
      const { store } = await import('./store');
      store.dispatch(logout());
      window.location.href = '/login?expired=true';
    }
  }

  return Promise.reject(error);
});

export default api;

