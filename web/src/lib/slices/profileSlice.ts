import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

interface Address {
  _id: string;
  title: string;
  fullAddress: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
  phone?: string;
  profileImage?: string;
  lastLogin?: string;
  addresses: Address[];
  wishlist: string[];
  cart: Array<{
    product: string;
    quantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

// Fetch user profile
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/profile', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch profile');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch profile'
      );
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data: { name?: string; phone?: string; profileImage?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put('/profile', data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to update profile');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update profile'
      );
    }
  }
);

// Add address
export const addAddress = createAsyncThunk(
  'profile/addAddress',
  async (
    data: {
      title: string;
      fullAddress: string;
      city: string;
      district: string;
      postalCode: string;
      phone: string;
      isDefault?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/profile/address', data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to add address');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to add address'
      );
    }
  }
);

// Update address
export const updateAddress = createAsyncThunk(
  'profile/updateAddress',
  async (
    {
      addressId,
      data,
    }: {
      addressId: string;
      data: {
        title?: string;
        fullAddress?: string;
        city?: string;
        district?: string;
        postalCode?: string;
        phone?: string;
        isDefault?: boolean;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/profile/address/${addressId}`, data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to update address');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update address'
      );
    }
  }
);

// Delete address
export const deleteAddress = createAsyncThunk(
  'profile/deleteAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/profile/address/${addressId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to delete address');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete address'
      );
    }
  }
);

// Add to wishlist
export const addToWishlist = createAsyncThunk(
  'profile/addToWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/profile/wishlist/${productId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to add to wishlist');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to add to wishlist'
      );
    }
  }
);

// Remove from wishlist
export const removeFromWishlist = createAsyncThunk(
  'profile/removeFromWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/profile/wishlist/${productId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to remove from wishlist');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to remove from wishlist'
      );
    }
  }
);

// Add to cart (backend)
export const addToCartBackend = createAsyncThunk(
  'profile/addToCartBackend',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/profile/cart', { productId, quantity });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to add to cart');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to add to cart'
      );
    }
  }
);

// Update cart item
export const updateCartItem = createAsyncThunk(
  'profile/updateCartItem',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/profile/cart/${productId}`, { quantity });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to update cart');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update cart'
      );
    }
  }
);

// Remove from cart
export const removeFromCartBackend = createAsyncThunk(
  'profile/removeFromCartBackend',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/profile/cart/${productId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to remove from cart');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to remove from cart'
      );
    }
  }
);

// Clear cart
export const clearCartBackend = createAsyncThunk(
  'profile/clearCartBackend',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/profile/cart');
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to clear cart');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to clear cart'
      );
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
    // Fetch profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add address
    builder
      .addCase(addAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update address
    builder
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete address
    builder
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add to wishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.profile = action.payload;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Remove from wishlist
    builder
      .addCase(removeFromWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.profile = action.payload;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;

