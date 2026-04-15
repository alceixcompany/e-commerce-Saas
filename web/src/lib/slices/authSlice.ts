import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { authService } from '../services/authService';
import { buildAsyncReducers, createInitialLoadingState, getErrorMessage, LoadingState } from '../redux-utils';
import { mapAuthError } from '@/utils/errorMapper';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: LoadingState;
  isVerifying: boolean; // For initial session check
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null, // Cookie-backed; no client-side storage
  loading: createInitialLoadingState([
    'login',
    'register',
    'google'
  ]),
  isVerifying: true, // Start true until verified
  isAuthenticated: false, // Will be corrected after verification
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error: unknown) {
      return rejectWithValue(mapAuthError(getErrorMessage(error)));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      return await authService.register(credentials);
    } catch (error: unknown) {
      return rejectWithValue(mapAuthError(getErrorMessage(error)));
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/google',
  async (token: string, { rejectWithValue }) => {
    try {
      return await authService.googleLogin(token);
    } catch (error: unknown) {
      return rejectWithValue(mapAuthError(getErrorMessage(error)));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authService.logout();
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
        localStorage.removeItem('cart');
      }
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isVerifying = false;
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
    // Login
    buildAsyncReducers(builder, loginUser, 'login', (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = 'verified';
    });

    // Register
    buildAsyncReducers(builder, registerUser, 'register', (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = 'verified';
    });

    // Google Login
    buildAsyncReducers(builder, googleLogin, 'google', (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = 'verified';
    });
  },
});

export const { logout, setUser, setToken, setVerifying, clearError } = authSlice.actions;
export default authSlice.reducer;
