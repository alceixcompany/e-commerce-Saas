import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { UserProfile, UpdateProfilePayload, AddressPayload } from '@/types/profile';
import { profileService } from '../services/profileService';
import { buildAsyncReducers, createInitialLoadingState, LoadingState } from '../redux-utils';

interface ProfileState {
  profile: UserProfile | null;
  loading: LoadingState;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: createInitialLoadingState([
    'fetch',
    'update',
    'address',
    'wishlist',
    'cart'
  ]),
  error: null,
  lastFetchedAt: null,
};

let inflightProfileRequest: Promise<UserProfile> | null = null;
const PROFILE_REUSE_WINDOW_MS = 2 * 60 * 1000;

// Async thunks (kept unchanged)
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (options: { silent?: boolean; forceRefresh?: boolean } | undefined, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const currentProfile = state.profile.profile;
    const lastFetchedAt = state.profile.lastFetchedAt;
    const fetchedRecently = !!lastFetchedAt && Date.now() - lastFetchedAt < PROFILE_REUSE_WINDOW_MS;
    
    // Optimization: Skip if already loaded and not forcing refresh
    if (!options?.forceRefresh && currentProfile && !state.profile.loading.fetch && fetchedRecently) {
      return currentProfile;
    }

    if (!options?.forceRefresh && inflightProfileRequest) {
      try {
        return await inflightProfileRequest;
      } catch (error: any) {
        return rejectWithValue(error.message);
      }
    }

    try {
      inflightProfileRequest = profileService.fetchProfile(options || {});
      return await inflightProfileRequest;
    } catch (error: any) {
      return rejectWithValue(error.message);
    } finally {
      inflightProfileRequest = null;
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data: UpdateProfilePayload, { rejectWithValue }) => {
    try {
      return await profileService.updateProfile(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addAddress = createAsyncThunk(
  'profile/addAddress',
  async (data: AddressPayload, { rejectWithValue }) => {
    try {
      return await profileService.addAddress(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  'profile/updateAddress',
  async ({ addressId, data }: { addressId: string; data: Partial<AddressPayload> }, { rejectWithValue }) => {
    try {
      return await profileService.updateAddress(addressId, data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'profile/deleteAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      return await profileService.deleteAddress(addressId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'profile/addToWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      return await profileService.addToWishlist(productId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'profile/removeFromWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      return await profileService.removeFromWishlist(productId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCartBackend = createAsyncThunk(
  'profile/addToCartBackend',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { rejectWithValue }) => {
    try {
      return await profileService.addToCart(productId, quantity);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'profile/updateCartItem',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      return await profileService.updateCartItem(productId, quantity);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCartBackend = createAsyncThunk(
  'profile/removeFromCartBackend',
  async (productId: string, { rejectWithValue }) => {
    try {
      return await profileService.removeFromCart(productId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCartBackend = createAsyncThunk(
  'profile/clearCartBackend',
  async (_, { rejectWithValue }) => {
    try {
      return await profileService.clearCart();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    buildAsyncReducers(builder, fetchProfile, 'fetch', (state, action) => {
      state.profile = action.payload;
      state.lastFetchedAt = Date.now();
    });

    buildAsyncReducers(builder, updateProfile, 'update', (state, action) => {
      state.profile = action.payload;
      state.lastFetchedAt = Date.now();
    });

    buildAsyncReducers(builder, addAddress, 'address', (state, action) => {
      state.profile = action.payload;
      state.lastFetchedAt = Date.now();
    });

    buildAsyncReducers(builder, updateAddress, 'address', (state, action) => {
      state.profile = action.payload;
      state.lastFetchedAt = Date.now();
    });

    buildAsyncReducers(builder, deleteAddress, 'address', (state, action) => {
      state.profile = action.payload;
      state.lastFetchedAt = Date.now();
    });

    buildAsyncReducers(builder, addToWishlist, 'wishlist', (state, action) => {
      state.profile = action.payload;
      state.lastFetchedAt = Date.now();
    });

    buildAsyncReducers(builder, removeFromWishlist, 'wishlist', (state, action) => {
      state.profile = action.payload;
      state.lastFetchedAt = Date.now();
    });

    // Cart operations (backend synced)
    buildAsyncReducers(builder, addToCartBackend, 'cart', (state, action) => {
      state.profile = action.payload;
      state.lastFetchedAt = Date.now();
    });

    buildAsyncReducers(builder, updateCartItem, 'cart', (state, action) => {
      state.profile = action.payload;
      state.lastFetchedAt = Date.now();
    });

    buildAsyncReducers(builder, removeFromCartBackend, 'cart', (state, action) => {
      state.profile = action.payload;
      state.lastFetchedAt = Date.now();
    });

    buildAsyncReducers(builder, clearCartBackend, 'cart', (state, action) => {
      state.profile = action.payload;
      state.lastFetchedAt = Date.now();
    });
  },
});

export const { clearError, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
