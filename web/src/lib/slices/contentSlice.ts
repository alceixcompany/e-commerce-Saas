import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

interface Banner {
    _id: string;
    title: string;
    description: string;
    image: string;
    buttonText: string;
    buttonUrl: string;
    order: number;
    status: 'active' | 'inactive';
}

interface PopularCollectionsContent {
    newArrivals: string;
    bestSellers: string;
}

interface ContentState {
    banners: Banner[];
    popularCollections: PopularCollectionsContent;
    isLoading: boolean;
    error: string | null;
}

const initialState: ContentState = {
    banners: [],
    popularCollections: {
        newArrivals: '',
        bestSellers: ''
    },
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchBanners = createAsyncThunk(
    'content/fetchBanners',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/public/banners');
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message || 'Failed to fetch banners');
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch banners'
            );
        }
    }
);

export const fetchPopularCollectionsContent = createAsyncThunk(
    'content/fetchPopularCollectionsContent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/public/section-content/popular_collections');
            if (response.data.success && response.data.data.content) {
                return response.data.data.content;
            }
            return rejectWithValue(response.data.message || 'Failed to fetch popular collections content');
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch popular collections content'
            );
        }
    }
);

// Admin Thunks

export const fetchAdminBanners = createAsyncThunk(
    'content/fetchAdminBanners',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/banners');
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message || 'Failed to fetch admin banners');
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch admin banners'
            );
        }
    }
);

export const createBanner = createAsyncThunk(
    'content/createBanner',
    async (bannerData: Partial<Banner>, { rejectWithValue }) => {
        try {
            const response = await api.post('/banners', bannerData);
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message || 'Failed to create banner');
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to create banner'
            );
        }
    }
);

export const updateBanner = createAsyncThunk(
    'content/updateBanner',
    async ({ id, data }: { id: string; data: Partial<Banner> }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/banners/${id}`, data);
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message || 'Failed to update banner');
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to update banner'
            );
        }
    }
);

export const deleteBanner = createAsyncThunk(
    'content/deleteBanner',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/banners/${id}`);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue(response.data.message || 'Failed to delete banner');
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to delete banner'
            );
        }
    }
);

export const fetchAdminPopularCollections = createAsyncThunk(
    'content/fetchAdminPopularCollections',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/section-content/popular_collections');
            if (response.data.success && response.data.data.content) {
                return response.data.data.content;
            }
            return rejectWithValue(response.data.message || 'Failed to fetch admin popular collections');
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch admin popular collections'
            );
        }
    }
);

export const updatePopularCollections = createAsyncThunk(
    'content/updatePopularCollections',
    async (content: PopularCollectionsContent, { rejectWithValue }) => {
        try {
            const response = await api.put('/section-content/popular_collections', { content });
            if (response.data.success) {
                return content;
            }
            return rejectWithValue(response.data.message || 'Failed to update popular collections');
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to update popular collections'
            );
        }
    }
);

const contentSlice = createSlice({
    name: 'content',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Banners
            .addCase(fetchBanners.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBanners.fulfilled, (state, action: PayloadAction<Banner[]>) => {
                state.isLoading = false;
                state.banners = action.payload;
            })
            .addCase(fetchBanners.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Popular Collections Content
            .addCase(fetchPopularCollectionsContent.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPopularCollectionsContent.fulfilled, (state, action: PayloadAction<PopularCollectionsContent>) => {
                state.isLoading = false;
                state.popularCollections = action.payload;
            })
            .addCase(fetchPopularCollectionsContent.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Admin Banners
            .addCase(fetchAdminBanners.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminBanners.fulfilled, (state, action: PayloadAction<Banner[]>) => {
                state.isLoading = false;
                state.banners = action.payload;
            })
            .addCase(fetchAdminBanners.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createBanner.fulfilled, (state, action: PayloadAction<Banner>) => {
                state.banners.push(action.payload);
            })
            .addCase(updateBanner.fulfilled, (state, action: PayloadAction<Banner>) => {
                const index = state.banners.findIndex(b => b._id === action.payload._id);
                if (index !== -1) {
                    state.banners[index] = action.payload;
                }
            })
            .addCase(deleteBanner.fulfilled, (state, action: PayloadAction<string>) => {
                state.banners = state.banners.filter(b => b._id !== action.payload);
            })
            // Admin Popular Collections
            .addCase(fetchAdminPopularCollections.fulfilled, (state, action: PayloadAction<PopularCollectionsContent>) => {
                state.popularCollections = action.payload;
            })
            .addCase(updatePopularCollections.fulfilled, (state, action: PayloadAction<PopularCollectionsContent>) => {
                state.popularCollections = action.payload;
            });
    },
});

export const { clearError } = contentSlice.actions;
export default contentSlice.reducer;
