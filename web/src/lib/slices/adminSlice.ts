import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  totalSpent?: number;
  orderCount?: number;
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalSales: number;
  paidOrders: number;
  unpaidOrders: number;
}

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

interface AdminState {
  users: User[];
  messages: Message[];
  stats: DashboardStats | null;
  selectedUser: User | null;
  selectedUserOrders: any[];
  isLoading: boolean;
  error: string | null;
  metadata: {
    total: number;
    page: number;
    pages: number;
  };
}

const initialState: AdminState = {
  users: [],
  messages: [],
  stats: null,
  selectedUser: null,
  selectedUserOrders: [],
  isLoading: false,
  error: null,
  metadata: {
    total: 0,
    page: 1,
    pages: 1,
  },
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/dashboard');
      if (response.data.success) {
        return response.data.data.stats;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch dashboard stats');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch dashboard stats'
      );
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params: { page?: number; limit?: number; q?: string; sort?: string } | undefined, { rejectWithValue }) => {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const q = params?.q ? `&q=${encodeURIComponent(params.q)}` : '';
      const sort = params?.sort ? `&sort=${params.sort}` : '';
      const response = await api.get(`/admin/users?page=${page}&limit=${limit}${q}${sort}`);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch users');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch users'
      );
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  'admin/fetchUserDetails',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch user details');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch user details'
      );
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }: { userId: string; role: 'user' | 'admin' }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to update user role');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update user role'
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        return userId;
      }
      return rejectWithValue(response.data.message || 'Failed to delete user');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete user'
      );
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'admin/fetchMessages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/contact');
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch messages');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch messages'
      );
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUsers: (state) => {
      state.users = [];
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.selectedUserOrders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        const { data, total, page, pages } = action.payload;
        if (page === 1) {
          state.users = data;
        } else {
          const newIds = new Set(data.map((u: User) => u._id));
          state.users = [
            ...state.users.filter(u => !newIds.has(u._id)),
            ...data
          ];
        }
        state.metadata = { total, page, pages };
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action: PayloadAction<{ user: User; orders: any[] }>) => {
        state.isLoading = false;
        state.selectedUser = action.payload.user;
        state.selectedUserOrders = action.payload.orders;
        state.error = null;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update User Role
      .addCase(updateUserRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? { ...user, role: action.payload.role } : user
        );
        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser.role = action.payload.role;
        }
        state.error = null;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
        if (state.selectedUser?._id === action.payload) {
          state.selectedUser = null;
          state.selectedUserOrders = [];
        }
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.isLoading = false;
        state.messages = action.payload;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearUsers, clearMessages, clearSelectedUser } = adminSlice.actions;
export default adminSlice.reducer;

