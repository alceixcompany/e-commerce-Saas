import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, UpdateProfilePayload, AddressPayload } from '@/types/profile';
import { profileService } from '../services/profileService';

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
  async (options: { silent?: boolean } | undefined, { rejectWithValue }) => {
    try {
      return await profileService.fetchProfile(options || {});
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update profile
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

// Add address
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

// Update address
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

// Delete address
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

// Add to wishlist
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

// Remove from wishlist
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

// Add to cart (backend)
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

// Update cart item
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

// Remove from cart
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

// Clear cart
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
