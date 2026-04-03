import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
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
      // Attempt to refresh the token
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
      
      if (response.data.success) {
        const newToken = response.data.data.token;
        
        // Save new token
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', newToken);
          const Cookies = require('js-cookie');
          Cookies.set('token', newToken, { expires: 7 });
        }

        // Update the header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    } catch (refreshError) {
      // If refresh fails, log out
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const Cookies = require('js-cookie');
        Cookies.remove('token');
        window.location.href = '/login';
      }
    }
  }

  // Handle other 401 cases or refresh failures
  if (error.response && error.response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const Cookies = require('js-cookie');
      Cookies.remove('token');
      window.location.href = '/login';
    }
  }

  return Promise.reject(error);
});

export default api;

