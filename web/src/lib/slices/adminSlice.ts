import { createSlice, createAsyncThunk, PayloadAction, EntityState } from '@reduxjs/toolkit';
import { AdminUser as User, DashboardStats, Message } from '@/types/admin';
import { Order } from '@/types/order';
import { adminService } from '../services/adminService';
import { buildAsyncReducers, createInitialLoadingState, LoadingState } from '../redux-utils';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { RootState } from '../store';

/**
 * Entity adapters for admin entities
 */
const usersAdapter = createEntityAdapter<User>({
  sortComparer: (a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.localeCompare(a.createdAt);
  },
});

const messagesAdapter = createEntityAdapter<Message>({
  sortComparer: (a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.localeCompare(a.createdAt);
  },
});

/**
 * Helpers to ensure entities have an 'id' field
 */
const mapUser = (u: any): User => ({ ...u, id: u._id || u.id });
const mapUsers = (users: any[]): User[] => users.map(mapUser);
const mapMessage = (m: any): Message => ({ ...m, id: m._id || m.id });
const mapMessages = (messages: any[]): Message[] => messages.map(mapMessage);

interface AdminState {
  userEntities: EntityState<User, string>;
  messageEntities: EntityState<Message, string>;
  stats: DashboardStats | null;
  selectedUser: User | null;
  selectedUserOrders: Order[];
  selectedUserOrdersMetadata: {
    total: number;
    page: number;
    pages: number;
  };
  loading: LoadingState;
  error: string | null;
  metadata: {
    total: number;
    page: number;
    pages: number;
  };
  // Compatibility fields
  users: User[];
  messages: Message[];
}

const initialState: AdminState = {
  userEntities: usersAdapter.getInitialState(),
  messageEntities: messagesAdapter.getInitialState(),
  stats: null,
  selectedUser: null,
  selectedUserOrders: [],
  loading: createInitialLoadingState([
    'stats',
    'fetchUsers',
    'userDetails',
    'updateRole',
    'deleteUser',
    'fetchMessages'
  ]),
  error: null,
  metadata: {
    total: 0,
    page: 1,
    pages: 1,
  },
  selectedUserOrdersMetadata: {
    total: 0,
    page: 1,
    pages: 1,
  },
  users: [],
  messages: [],
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
  async (params: { page?: number; limit?: number; q?: string; sort?: string; role?: string } | undefined, { rejectWithValue }) => {
    try {
      return await adminService.fetchUsers(params || {});
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  'admin/fetchUserDetails',
  async ({ userId, page, limit }: { userId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      return await adminService.fetchUserDetails(userId, { page, limit });
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

export const bulkDeleteUsers = createAsyncThunk(
  'admin/bulkDeleteUsers',
  async (ids: string[], { rejectWithValue }) => {
    try {
      return await adminService.bulkDeleteUsers(ids);
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
      usersAdapter.removeAll(state.userEntities);
      state.users = [];
    },
    clearMessages: (state) => {
      messagesAdapter.removeAll(state.messageEntities);
      state.messages = [];
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.selectedUserOrders = [];
      state.selectedUserOrdersMetadata = { total: 0, page: 1, pages: 1 };
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboard Stats
    buildAsyncReducers(builder, fetchDashboardStats, 'stats', (state, action) => {
      state.stats = action.payload;
    });

    // Fetch Users
    buildAsyncReducers(builder, fetchUsers, 'fetchUsers', (state, action) => {
      const { data, total, page, pages } = action.payload;
      const mappedData = mapUsers(data);
      if (Number(page) === 1) {
        usersAdapter.setAll(state.userEntities, mappedData);
      } else {
        usersAdapter.upsertMany(state.userEntities, mappedData);
      }
      state.metadata = { total, page, pages };
      state.users = usersAdapter.getSelectors().selectAll(state.userEntities);
    });

    // Fetch User Details
    buildAsyncReducers(builder, fetchUserDetails, 'userDetails', (state, action) => {
      state.selectedUser = mapUser(action.payload.user);
      state.selectedUserOrders = action.payload.orders;
      state.selectedUserOrdersMetadata = action.payload.metadata || { total: 0, page: 1, pages: 1 };
      usersAdapter.upsertOne(state.userEntities, state.selectedUser);
      state.users = usersAdapter.getSelectors().selectAll(state.userEntities);
    });

    // Update User Role
    buildAsyncReducers(builder, updateUserRole, 'updateRole', (state, action) => {
      const mappedUser = mapUser(action.payload);
      usersAdapter.upsertOne(state.userEntities, mappedUser);
      if (state.selectedUser && state.selectedUser.id === mappedUser.id) {
        state.selectedUser.role = mappedUser.role;
      }
      state.users = usersAdapter.getSelectors().selectAll(state.userEntities);
    });

    // Delete User
    buildAsyncReducers(builder, deleteUser, 'deleteUser', (state, action) => {
      usersAdapter.removeOne(state.userEntities, action.payload);
      if (state.selectedUser && state.selectedUser.id === action.payload) {
        state.selectedUser = null;
        state.selectedUserOrders = [];
      }
      state.users = usersAdapter.getSelectors().selectAll(state.userEntities);
    });

    // Bulk Delete Users
    buildAsyncReducers(builder, bulkDeleteUsers, 'deleteUser', (state, action) => {
      usersAdapter.removeMany(state.userEntities, action.payload);
      state.users = usersAdapter.getSelectors().selectAll(state.userEntities);
    });

    // Fetch Messages
    buildAsyncReducers(builder, fetchMessages, 'fetchMessages', (state, action) => {
      const mappedMessages = mapMessages(action.payload);
      messagesAdapter.setAll(state.messageEntities, mappedMessages);
      state.messages = messagesAdapter.getSelectors().selectAll(state.messageEntities);
    });
  },
});

// Selectors
export const adminUserSelectors = usersAdapter.getSelectors((state: RootState) => state.admin.userEntities);
export const adminMessageSelectors = messagesAdapter.getSelectors((state: RootState) => state.admin.messageEntities);

export const { clearError, clearUsers, clearMessages, clearSelectedUser } = adminSlice.actions;
export default adminSlice.reducer;
