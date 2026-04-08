import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
    Banner, 
    PopularCollectionsContent, 
    GlobalSettings, 
    HomeSettings, 
    ProductSettings, 
    AboutSettings, 
    ContactSettings, 
    AuthSettings, 
    LegalSettings 
} from '@/types/content';
import { contentService } from '../services/contentService';
import { DEFAULT_GLOBAL_SETTINGS } from '../../config/site-defaults.config';

// --- State ---

interface ContentState {
    banners: Banner[];
    popularCollections: PopularCollectionsContent;
    globalSettings: GlobalSettings;
    homeSettings: HomeSettings;
    productSettings: ProductSettings;
    aboutSettings: AboutSettings;
    contactSettings: ContactSettings;
    authSettings: AuthSettings;
    privacySettings: LegalSettings;
    termsSettings: LegalSettings;
    accessibilitySettings: LegalSettings;
    isLoading: boolean;
    error: string | null;
}

const initialState: ContentState = {
    banners: [],
    popularCollections: {
        newArrivals: '/image/alceix/product.png',
        bestSellers: '/image/alceix/hero.png',
        newArrivalsTitle: '',
        newArrivalsLink: '',
        bestSellersTitle: '',
        bestSellersLink: ''
    },
    globalSettings: DEFAULT_GLOBAL_SETTINGS,
    homeSettings: { sectionOrder: [], hiddenSections: [] },
    productSettings: { sectionOrder: [], hiddenSections: [] },
    aboutSettings: { sectionOrder: [], hiddenSections: [] },
    contactSettings: { sectionOrder: [], hiddenSections: [] },
    authSettings: {
        login: { layout: 'split-left', title: '', quote: '', imageUrl: '' },
        register: { layout: 'split-left', title: '', quote: '', imageUrl: '' }
    },
    privacySettings: { title: 'Privacy Policy', content: '', sectionOrder: [], hiddenSections: [] },
    termsSettings: { title: 'Terms of Service', content: '', sectionOrder: [], hiddenSections: [] },
    accessibilitySettings: { title: 'Accessibility Statement', content: '', sectionOrder: [], hiddenSections: [] },
    isLoading: false,
    error: null,
};

// --- THUNKS ---

export const fetchBootstrapConfig = createAsyncThunk(
    'content/fetchBootstrapConfig',
    async (forceRefresh: boolean | undefined, { rejectWithValue }) => {
        try {
            return await contentService.fetchBootstrap(forceRefresh);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchBanners = createAsyncThunk(
    'content/fetchBanners',
    async (forceRefresh: boolean | undefined, { rejectWithValue }) => {
        try {
            return await contentService.fetchBanners(forceRefresh);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPopularCollectionsContent = createAsyncThunk(
    'content/fetchPopularCollectionsContent',
    async (forceRefresh: boolean | undefined, { rejectWithValue }) => {
        try {
            return await contentService.fetchPopularCollections(forceRefresh);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAdminBanners = createAsyncThunk(
    'content/fetchAdminBanners',
    async (_, { rejectWithValue }) => {
        try {
            return await contentService.fetchAdminBanners();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createBanner = createAsyncThunk(
    'content/createBanner',
    async (bannerData: Partial<Banner>, { rejectWithValue }) => {
        try {
            return await contentService.createBanner(bannerData);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateBanner = createAsyncThunk(
    'content/updateBanner',
    async ({ id, data }: { id: string; data: Partial<Banner> }, { rejectWithValue }) => {
        try {
            return await contentService.updateBanner(id, data);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteBanner = createAsyncThunk(
    'content/deleteBanner',
    async (id: string, { rejectWithValue }) => {
        try {
            return await contentService.deleteBanner(id);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAdminPopularCollections = createAsyncThunk(
    'content/fetchAdminPopularCollections',
    async (_, { rejectWithValue }) => {
        try {
            return await contentService.fetchAdminPopularCollections();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updatePopularCollections = createAsyncThunk(
    'content/updatePopularCollections',
    async (content: PopularCollectionsContent, { rejectWithValue }) => {
        try {
            return await contentService.updatePopularCollections(content);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchGlobalSettings = createAsyncThunk(
    'content/fetchGlobalSettings',
    async (forceRefresh: boolean | undefined, { rejectWithValue }) => {
        try {
            return await contentService.fetchGlobalSettings(forceRefresh);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateGlobalSettings = createAsyncThunk(
    'content/updateGlobalSettings',
    async (content: GlobalSettings, { rejectWithValue }) => {
        try {
            return await contentService.updateGlobalSettings(content);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchHomeSettings = createAsyncThunk(
    'content/fetchHomeSettings',
    async (forceRefresh: boolean | undefined, { rejectWithValue }) => {
        try {
            return await contentService.fetchHomeSettings(forceRefresh);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAdminHomeSettings = createAsyncThunk(
    'content/fetchAdminHomeSettings',
    async (_, { rejectWithValue }) => {
        try {
            return await contentService.fetchAdminHomeSettings();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateHomeSettings = createAsyncThunk(
    'content/updateHomeSettings',
    async (content: HomeSettings, { rejectWithValue }) => {
        try {
            return await contentService.updateHomeSettings(content);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchProductSettings = createAsyncThunk(
    'content/fetchProductSettings',
    async (forceRefresh: boolean | undefined, { rejectWithValue }) => {
        try {
            return await contentService.fetchProductSettings(forceRefresh);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAdminProductSettings = createAsyncThunk(
    'content/fetchAdminProductSettings',
    async (_, { rejectWithValue }) => {
        try {
            return await contentService.fetchAdminProductSettings();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateProductSettings = createAsyncThunk(
    'content/updateProductSettings',
    async (content: ProductSettings, { rejectWithValue }) => {
        try {
            return await contentService.updateProductSettings(content);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAboutSettings = createAsyncThunk(
    'content/fetchAboutSettings',
    async (forceRefresh: boolean | undefined, { rejectWithValue }) => {
        try {
            return await contentService.fetchAboutSettings(forceRefresh);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAdminAboutSettings = createAsyncThunk(
    'content/fetchAdminAboutSettings',
    async (_, { rejectWithValue }) => {
        try {
            return await contentService.fetchAdminAboutSettings();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateAboutSettings = createAsyncThunk(
    'content/updateAboutSettings',
    async (content: AboutSettings, { rejectWithValue }) => {
        try {
            return await contentService.updateAboutSettings(content);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchContactSettings = createAsyncThunk(
    'content/fetchContactSettings',
    async (forceRefresh: boolean | undefined, { rejectWithValue }) => {
        try {
            return await contentService.fetchContactSettings(forceRefresh);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAdminContactSettings = createAsyncThunk(
    'content/fetchAdminContactSettings',
    async (_, { rejectWithValue }) => {
        try {
            return await contentService.fetchAdminContactSettings();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateContactSettings = createAsyncThunk(
    'content/updateContactSettings',
    async (content: ContactSettings, { rejectWithValue }) => {
        try {
            return await contentService.updateContactSettings(content);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAuthSettings = createAsyncThunk(
    'content/fetchAuthSettings',
    async (forceRefresh: boolean | undefined, { rejectWithValue }) => {
        try {
            return await contentService.fetchAuthSettings(forceRefresh);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAdminAuthSettings = createAsyncThunk(
    'content/fetchAdminAuthSettings',
    async (_, { rejectWithValue }) => {
        try {
            return await contentService.fetchAdminAuthSettings();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateAuthSettings = createAsyncThunk(
    'content/updateAuthSettings',
    async (content: AuthSettings, { rejectWithValue }) => {
        try {
            return await contentService.updateAuthSettings(content);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchLegalSettings = createAsyncThunk(
    'content/fetchLegalSettings',
    async ({ type, forceRefresh }: { type: 'privacy_policy' | 'terms_of_service' | 'accessibility', forceRefresh?: boolean }, { rejectWithValue }) => {
        try {
            return await contentService.fetchLegalSettings(type, forceRefresh);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateLegalSettings = createAsyncThunk(
    'content/updateLegalSettings',
    async ({ type, content }: { type: 'privacy_policy' | 'terms_of_service' | 'accessibility', content: LegalSettings }, { rejectWithValue }) => {
        try {
            return await contentService.updateLegalSettings(type, content);
        } catch (error: any) {
            return rejectWithValue(error.message);
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
            // Bootstrap
            .addCase(fetchBootstrapConfig.pending, (state) => { state.isLoading = true; })
            .addCase(fetchBootstrapConfig.fulfilled, (state, action) => {
                const { global_settings, home_settings, product_settings, contact_settings } = action.payload;
                if (global_settings) state.globalSettings = global_settings;
                if (home_settings) state.homeSettings = home_settings;
                if (product_settings) state.productSettings = product_settings;
                if (contact_settings) state.contactSettings = contact_settings;
                state.isLoading = false;
            })
            .addCase(fetchBootstrapConfig.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Banners
            .addCase(fetchBanners.pending, (state) => { state.isLoading = true; })
            .addCase(fetchBanners.fulfilled, (state, action) => { 
                state.banners = action.payload; 
                state.isLoading = false;
            })
            .addCase(fetchBanners.rejected, (state) => { state.isLoading = false; })
            .addCase(fetchAdminBanners.pending, (state) => { state.isLoading = true; })
            .addCase(fetchAdminBanners.fulfilled, (state, action) => { 
                state.banners = action.payload; 
                state.isLoading = false;
            })
            .addCase(fetchAdminBanners.rejected, (state) => { state.isLoading = false; })
            .addCase(createBanner.fulfilled, (state, action) => { state.banners.push(action.payload); })
            .addCase(updateBanner.fulfilled, (state, action) => {
                const index = state.banners.findIndex(b => b._id === action.payload._id);
                if (index !== -1) state.banners[index] = action.payload;
            })
            .addCase(deleteBanner.fulfilled, (state, action) => {
                state.banners = state.banners.filter(b => b._id !== action.payload);
            })
            // Popular Collections
            .addCase(fetchPopularCollectionsContent.fulfilled, (state, action) => { state.popularCollections = action.payload; })
            .addCase(fetchAdminPopularCollections.fulfilled, (state, action) => { state.popularCollections = action.payload; })
            .addCase(updatePopularCollections.fulfilled, (state, action) => { state.popularCollections = action.payload; })
            // Global Settings
            .addCase(fetchGlobalSettings.fulfilled, (state, action) => { state.globalSettings = action.payload; })
            .addCase(updateGlobalSettings.fulfilled, (state, action) => { state.globalSettings = action.payload; })
            // Home Settings
            .addCase(fetchHomeSettings.pending, (state) => { state.isLoading = true; })
            .addCase(fetchHomeSettings.fulfilled, (state, action) => { 
                state.homeSettings = action.payload; 
                state.isLoading = false;
            })
            .addCase(fetchHomeSettings.rejected, (state) => { state.isLoading = false; })
            .addCase(fetchAdminHomeSettings.pending, (state) => { state.isLoading = true; })
            .addCase(fetchAdminHomeSettings.fulfilled, (state, action) => { 
                state.homeSettings = action.payload; 
                state.isLoading = false;
            })
            .addCase(fetchAdminHomeSettings.rejected, (state) => { state.isLoading = false; })
            .addCase(updateHomeSettings.fulfilled, (state, action) => { state.homeSettings = action.payload; })
            // Product Settings
            .addCase(fetchProductSettings.fulfilled, (state, action) => { state.productSettings = action.payload; })
            .addCase(fetchAdminProductSettings.fulfilled, (state, action) => { state.productSettings = action.payload; })
            .addCase(updateProductSettings.fulfilled, (state, action) => { state.productSettings = action.payload; })
            // About Settings
            .addCase(fetchAboutSettings.fulfilled, (state, action) => { state.aboutSettings = action.payload; })
            .addCase(fetchAdminAboutSettings.fulfilled, (state, action) => { state.aboutSettings = action.payload; })
            .addCase(updateAboutSettings.fulfilled, (state, action) => { state.aboutSettings = action.payload; })
            // Contact Settings
            .addCase(fetchContactSettings.fulfilled, (state, action) => { state.contactSettings = action.payload; })
            .addCase(fetchAdminContactSettings.fulfilled, (state, action) => { state.contactSettings = action.payload; })
            .addCase(updateContactSettings.fulfilled, (state, action) => { state.contactSettings = action.payload; })
            // Auth Settings
            .addCase(fetchAuthSettings.fulfilled, (state, action) => { state.authSettings = action.payload; })
            .addCase(fetchAdminAuthSettings.fulfilled, (state, action) => { state.authSettings = action.payload; })
            .addCase(updateAuthSettings.fulfilled, (state, action) => { state.authSettings = action.payload; })
            // Legal Settings
            .addCase(fetchLegalSettings.fulfilled, (state, action) => {
                if (action.payload.content) {
                    if (action.payload.type === 'privacy_policy') state.privacySettings = action.payload.content;
                    else if (action.payload.type === 'terms_of_service') state.termsSettings = action.payload.content;
                    else if (action.payload.type === 'accessibility') state.accessibilitySettings = action.payload.content;
                }
            })
            .addCase(updateLegalSettings.fulfilled, (state, action) => {
                if (action.payload.type === 'privacy_policy') state.privacySettings = action.payload.content;
                else if (action.payload.type === 'terms_of_service') state.termsSettings = action.payload.content;
                else if (action.payload.type === 'accessibility') state.accessibilitySettings = action.payload.content;
            });
    },
});

export const { clearError } = contentSlice.actions;
export default contentSlice.reducer;
