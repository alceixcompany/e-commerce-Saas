import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
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

      if (typeof obj === 'string' && obj.includes('localhost:5001')) {
        return obj.replace('http://localhost:5001', process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://nila-ecommerce.onrender.com');
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
});

export default api;

