import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { UserProfile, UpdateProfilePayload, AddressPayload } from '@/types/profile';
import { profileService } from '../services/profileService';
import { buildAsyncReducers, createInitialLoadingState, LoadingState } from '../redux-utils';

interface ProfileState {
  profile: UserProfile | null;
  loading: LoadingState;
  error: string | null;
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
};

// Async thunks (kept unchanged)
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (options: { silent?: boolean; forceRefresh?: boolean } | undefined, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const currentProfile = state.profile.profile;
    
    // Optimization: Skip if already loaded and not forcing refresh
    if (!options?.forceRefresh && currentProfile && !state.profile.loading.fetch) {
      return currentProfile;
    }

    try {
      return await profileService.fetchProfile(options || {});
    } catch (error: any) {
      return rejectWithValue(error.message);
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
    },
  },
  extraReducers: (builder) => {
    buildAsyncReducers(builder, fetchProfile, 'fetch', (state, action) => {
      state.profile = action.payload;
    });

    buildAsyncReducers(builder, updateProfile, 'update', (state, action) => {
      state.profile = action.payload;
    });

    buildAsyncReducers(builder, addAddress, 'address', (state, action) => {
      state.profile = action.payload;
    });

    buildAsyncReducers(builder, updateAddress, 'address', (state, action) => {
      state.profile = action.payload;
    });

    buildAsyncReducers(builder, deleteAddress, 'address', (state, action) => {
      state.profile = action.payload;
    });

    buildAsyncReducers(builder, addToWishlist, 'wishlist', (state, action) => {
      state.profile = action.payload;
    });

    buildAsyncReducers(builder, removeFromWishlist, 'wishlist', (state, action) => {
      state.profile = action.payload;
    });

    // Cart operations (backend synced)
    buildAsyncReducers(builder, addToCartBackend, 'cart', (state, action) => {
      state.profile = action.payload;
    });

    buildAsyncReducers(builder, updateCartItem, 'cart', (state, action) => {
      state.profile = action.payload;
    });

    buildAsyncReducers(builder, removeFromCartBackend, 'cart', (state, action) => {
      state.profile = action.payload;
    });

    buildAsyncReducers(builder, clearCartBackend, 'cart', (state, action) => {
      state.profile = action.payload;
    });
  },
});

export const { clearError, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
