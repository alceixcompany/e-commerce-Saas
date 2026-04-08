import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import api from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isVerifying: boolean; // For initial session check
  isAuthenticated: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

const initialState: AuthState = {
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  token: null, // Token string is now in HttpOnly cookie, we don't store it here
  isLoading: false,
  isVerifying: true, // Start true until verified
  isAuthenticated: false, // Will be set after verification or login
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      if (response.data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
          localStorage.removeItem('cart');
        }
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Login failed');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed'
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', credentials);
      if (response.data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Registration failed');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Registration failed'
      );
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/google',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/google', { token });
      if (response.data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Google login failed');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Google login failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed on server', error);
    } finally {
      dispatch(logout());
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isVerifying = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
      }
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(action.payload));
        }
      } else {
        state.isAuthenticated = false;
      }
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload; // 'verified' or null
      state.isAuthenticated = !!action.payload;
    },
    setVerifying: (state, action: PayloadAction<boolean>) => {
      state.isVerifying = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setUser, setToken, setVerifying, clearError } = authSlice.actions;
export default authSlice.reducer;
