import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AdminUser as User, DashboardStats, Message } from '@/types/admin';
import { Order } from '@/types/order';
import { adminService } from '../services/adminService';

interface AdminState {
  users: User[];
  messages: Message[];
  stats: DashboardStats | null;
  selectedUser: User | null;
  selectedUserOrders: Order[];
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
      return await adminService.fetchDashboardStats();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params: { page?: number; limit?: number; q?: string; sort?: string } | undefined, { rejectWithValue }) => {
    try {
      return await adminService.fetchUsers(params || {});
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  'admin/fetchUserDetails',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await adminService.fetchUserDetails(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }: { userId: string; role: 'user' | 'admin' }, { rejectWithValue }) => {
    try {
      return await adminService.updateUserRole(userId, role);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await adminService.deleteUser(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'admin/fetchMessages',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.fetchMessages();
    } catch (error: any) {
      return rejectWithValue(error.message);
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
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{ data: User[]; total: number; page: number; pages: number }>) => {
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
      .addCase(fetchUserDetails.fulfilled, (state, action: PayloadAction<{ user: User; orders: Order[] }>) => {
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
