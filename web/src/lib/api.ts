import axios from 'axios';
import { useAuthStore } from './store/useAuthStore';

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

// --- Refresh Token Queue (prevents race conditions) ---
// When multiple requests get 401 simultaneously, only ONE refresh call is made.
// All other requests wait for that single refresh to complete, then retry.
let isRefreshing = false;
let refreshSubscribers: ((success: boolean) => void)[] = [];

const onRefreshComplete = (success: boolean) => {
  // Add a tiny delay (100ms) to ensure the browser has processed the Set-Cookie headers 
  // before the waiting requests are fired.
  setTimeout(() => {
    refreshSubscribers.forEach(cb => cb(success));
    refreshSubscribers = [];
  }, 100);
};

const waitForRefresh = (): Promise<boolean> => {
  return new Promise(resolve => {
    refreshSubscribers.push(resolve);
  });
};

// Request interceptor: No longer needs to manually inject token as browser handles cookies
api.interceptors.request.use((config) => {
  return config;
});

// Fix localhost image URLs in production
api.interceptors.response.use((response) => {
  if (typeof window !== 'undefined' && response.data) {
    const fixImageUrl = (obj: unknown): unknown => {
      if (!obj) return obj;

      if (typeof obj === 'string' && (obj.includes('localhost:5001') || obj.includes('localhost:5000'))) {
        // Skip URL fixing entirely if we are on localhost
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          return obj;
        }

        // Only replace if we are in production and have a production base
        const productionBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');
        if (productionBase && productionBase.startsWith('http') && !productionBase.includes('localhost')) {
          return obj.replace(/http:\/\/localhost:500[01]/g, productionBase);
        }
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.filter(item => item !== null && item !== undefined).map(fixImageUrl);
      }

      if (typeof obj === 'object' && obj !== null) {
        const fixed: Record<string, unknown> = {};
        const source = obj as Record<string, unknown>;
        for (const key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            fixed[key] = fixImageUrl(source[key]);
          }
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

  // Only attempt refresh on 401 (Unauthorized / Token Expired).
  // 403 means "authenticated but not authorized" — refreshing won't grant new permissions.
  if (error.response?.status === 401 && !originalRequest._retry) {
    // Don't try to refresh the refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If another request is already refreshing, wait for it instead of firing a duplicate
    if (isRefreshing) {
      try {
        const success = await waitForRefresh();
        if (success) {
          // Retry the original request with refreshed cookies
          return api({
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
        }
        return Promise.reject(error);
      } catch {
        return Promise.reject(error);
      }
    }

    // This is the FIRST request to detect the expired token — it handles the refresh
    isRefreshing = true;

    try {
      // Attempt to refresh the token via HttpOnly Cookies
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, { 
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.data.success) {
        // Notify all waiting requests that refresh succeeded
        isRefreshing = false;
        onRefreshComplete(true);

        // Silent retry: Use the 'api' instance to preserve baseURL (/api)
        return api({
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
      }
    } catch (refreshError) {
      // Refresh failed — notify all waiting requests
      isRefreshing = false;
      onRefreshComplete(false);

      // If refresh fails, only redirect if it's NOT a skipAuthRedirect case
      if (!skipAuthRedirect && typeof window !== 'undefined') {
        useAuthStore.getState().logout();
        
        const isAuthPage = window.location.pathname.startsWith('/admin') || 
                          window.location.pathname.startsWith('/profile') || 
                          window.location.pathname.startsWith('/checkout');
        
        if (isAuthPage) {
          window.location.href = `/login?expired=true&returnUrl=${encodeURIComponent(window.location.pathname)}`;
        }
      }
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
});

export default api;
