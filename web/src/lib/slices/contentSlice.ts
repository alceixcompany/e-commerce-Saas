import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
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
import { buildAsyncReducers, createInitialLoadingState, LoadingState } from '../redux-utils';
const inflightContentRequests = new Map<string, Promise<any>>();
const hasSectionConfig = (value: { sectionOrder?: any[]; hiddenSections?: any[] } | undefined) =>
    !!value && (Array.isArray(value.sectionOrder) || Array.isArray(value.hiddenSections));
const hasAuthContent = (value: AuthSettings | undefined) =>
    !!value && (
        !!value.login?.title ||
        !!value.login?.quote ||
        !!value.login?.imageUrl ||
        !!value.register?.title ||
        !!value.register?.quote ||
        !!value.register?.imageUrl
    );
const hasLegalContent = (value: LegalSettings | undefined) =>
    !!value && (!!value.content || !!value.lastUpdated || (Array.isArray(value.sectionOrder) && value.sectionOrder.length > 0));

// --- State ---

interface ContentState {
    banners: Banner[];
    hasFetchedBanners: boolean;
    popularCollections: PopularCollectionsContent;
    hasFetchedPopularCollections: boolean;
    globalSettings: GlobalSettings;
    homeSettings: HomeSettings;
    productSettings: ProductSettings;
    aboutSettings: AboutSettings;
    contactSettings: ContactSettings;
    authSettings: AuthSettings;
    privacySettings: LegalSettings;
    termsSettings: LegalSettings;
    accessibilitySettings: LegalSettings;
    hasLoadedOnce: boolean;
    loading: LoadingState;
    error: string | null;
}

const initialState: ContentState = {
    banners: [],
    hasFetchedBanners: false,
    popularCollections: {
        newArrivals: '/image/alceix/product.png',
        bestSellers: '/image/alceix/hero.png',
        newArrivalsTitle: '',
        newArrivalsLink: '',
        bestSellersTitle: '',
        bestSellersLink: ''
    },
    hasFetchedPopularCollections: false,
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
    hasLoadedOnce: false,
    loading: createInitialLoadingState([
        'bootstrap',
        'banners',
        'popularCollections',
        'globalSettings',
        'homeSettings',
        'productSettings',
        'aboutSettings',
        'contactSettings',
        'authSettings',
        'legalSettings'
    ]),
    error: null,
};

// --- THUNKS ---

export const fetchBootstrapConfig = createAsyncThunk(
    'content/fetchBootstrapConfig',
    async (forceRefresh: boolean | undefined, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const requestKey = forceRefresh ? 'bootstrap:refresh' : 'bootstrap';
        if (!forceRefresh && state.content.hasLoadedOnce && !state.content.loading.bootstrap) {
            return {
                banners: state.content.banners,
                popular_collections: state.content.popularCollections,
                global_settings: state.content.globalSettings,
                home_settings: state.content.homeSettings,
                product_settings: state.content.productSettings,
                contact_settings: state.content.contactSettings
            };
        }
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchBootstrap(forceRefresh);
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
        }
    }
);

export const fetchBanners = createAsyncThunk(
    'content/fetchBanners',
    async (forceRefresh: boolean | undefined, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const requestKey = forceRefresh ? 'banners:refresh' : 'banners';
        if (!forceRefresh && state.content.hasFetchedBanners && !state.content.loading.banners) {
            return state.content.banners;
        }
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchBanners(forceRefresh);
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
        }
    }
);

export const fetchPopularCollectionsContent = createAsyncThunk(
    'content/fetchPopularCollectionsContent',
    async (forceRefresh: boolean | undefined, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const requestKey = forceRefresh ? 'popularCollections:refresh' : 'popularCollections';
        const popularCollections = state.content.popularCollections;
        const hasDisplayContent =
            !!popularCollections?.newArrivalsTitle ||
            !!popularCollections?.bestSellersTitle ||
            !!popularCollections?.newArrivalsLink ||
            !!popularCollections?.bestSellersLink;

        if (
            !forceRefresh &&
            (state.content.hasFetchedPopularCollections || hasDisplayContent) &&
            !state.content.loading.popularCollections
        ) {
            return popularCollections;
        }
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchPopularCollections(forceRefresh);
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
        }
    }
);

export const fetchAdminBanners = createAsyncThunk(
    'content/fetchAdminBanners',
    async (_, { rejectWithValue }) => {
        const requestKey = 'adminBanners';
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchAdminBanners();
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
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
        const requestKey = 'adminPopularCollections';
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchAdminPopularCollections();
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
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
    async (forceRefresh: boolean | undefined, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const requestKey = forceRefresh ? 'globalSettings:refresh' : 'globalSettings';
        // Optimization: Don't fetch if already loaded and not forcing refresh
        if (!forceRefresh && state.content.hasLoadedOnce && !state.content.loading.globalSettings) {
            return state.content.globalSettings;
        }
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchGlobalSettings(forceRefresh);
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
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
    async (forceRefresh: boolean | undefined, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        if (!forceRefresh && hasSectionConfig(state.content.homeSettings) && !state.content.loading.homeSettings) {
            return state.content.homeSettings;
        }
        const requestKey = forceRefresh ? 'homeSettings:refresh' : 'homeSettings';
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchHomeSettings(forceRefresh);
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
        }
    }
);

export const fetchAdminHomeSettings = createAsyncThunk(
    'content/fetchAdminHomeSettings',
    async (_, { rejectWithValue }) => {
        const requestKey = 'adminHomeSettings';
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchAdminHomeSettings();
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
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
    async (forceRefresh: boolean | undefined, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        if (!forceRefresh && hasSectionConfig(state.content.productSettings) && !state.content.loading.productSettings) {
            return state.content.productSettings;
        }
        const requestKey = forceRefresh ? 'productSettings:refresh' : 'productSettings';
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchProductSettings(forceRefresh);
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
        }
    }
);

export const fetchAdminProductSettings = createAsyncThunk(
    'content/fetchAdminProductSettings',
    async (_, { rejectWithValue }) => {
        const requestKey = 'adminProductSettings';
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchAdminProductSettings();
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
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
    async (forceRefresh: boolean | undefined, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const requestKey = forceRefresh ? 'aboutSettings:refresh' : 'aboutSettings';
        if (!forceRefresh && hasSectionConfig(state.content.aboutSettings) && !state.content.loading.aboutSettings) {
            return state.content.aboutSettings;
        }
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchAboutSettings(forceRefresh);
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
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
    async (forceRefresh: boolean | undefined, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const requestKey = forceRefresh ? 'contactSettings:refresh' : 'contactSettings';
        if (!forceRefresh && hasSectionConfig(state.content.contactSettings) && !state.content.loading.contactSettings) {
            return state.content.contactSettings;
        }
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchContactSettings(forceRefresh);
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
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
    async (forceRefresh: boolean | undefined, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const requestKey = forceRefresh ? 'authSettings:refresh' : 'authSettings';
        if (!forceRefresh && hasAuthContent(state.content.authSettings) && !state.content.loading.authSettings) {
            return state.content.authSettings;
        }
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchAuthSettings(forceRefresh);
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
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
    async ({ type, forceRefresh }: { type: 'privacy_policy' | 'terms_of_service' | 'accessibility', forceRefresh?: boolean }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const requestKey = forceRefresh ? `legalSettings:${type}:refresh` : `legalSettings:${type}`;
        const existing =
            type === 'privacy_policy'
                ? state.content.privacySettings
                : type === 'terms_of_service'
                    ? state.content.termsSettings
                    : state.content.accessibilitySettings;

        if (!forceRefresh && hasLegalContent(existing) && !state.content.loading.legalSettings) {
            return existing;
        }
        try {
            if (inflightContentRequests.has(requestKey)) {
                return await inflightContentRequests.get(requestKey)!;
            }

            const request = contentService.fetchLegalSettings(type, forceRefresh);
            inflightContentRequests.set(requestKey, request);
            return await request;
        } catch (error: any) {
            return rejectWithValue(error.message);
        } finally {
            inflightContentRequests.delete(requestKey);
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
        hydrateContent: (state, action: PayloadAction<any>) => {
            const { banners, popular_collections, global_settings, home_settings, product_settings, contact_settings } = action.payload;
            if (Array.isArray(banners)) {
                state.banners = banners;
                state.hasFetchedBanners = true;
            }
            if (popular_collections) {
                state.popularCollections = popular_collections;
                state.hasFetchedPopularCollections = true;
            }
            if (global_settings) state.globalSettings = global_settings;
            if (home_settings) state.homeSettings = home_settings;
            if (product_settings) state.productSettings = product_settings;
            if (contact_settings) state.contactSettings = contact_settings;
            state.hasLoadedOnce = true;
        }
    },
    extraReducers: (builder) => {
        // Bootstrap
        buildAsyncReducers(builder, fetchBootstrapConfig, 'bootstrap', (state, action) => {
            const { banners, popular_collections, global_settings, home_settings, product_settings, contact_settings } = action.payload;
            if (Array.isArray(banners)) {
                state.banners = banners;
                state.hasFetchedBanners = true;
            }
            if (popular_collections) {
                state.popularCollections = popular_collections;
                state.hasFetchedPopularCollections = true;
            }
            if (global_settings) state.globalSettings = global_settings;
            if (home_settings) state.homeSettings = home_settings;
            if (product_settings) state.productSettings = product_settings;
            if (contact_settings) state.contactSettings = contact_settings;
        });

        // Banners
        buildAsyncReducers(builder, fetchBanners, 'banners', (state, action) => { 
            state.banners = action.payload; 
            state.hasFetchedBanners = true;
        });
        buildAsyncReducers(builder, fetchAdminBanners, 'banners', (state, action) => { 
            state.banners = action.payload; 
            state.hasFetchedBanners = true;
        });
        
        buildAsyncReducers(builder, createBanner, 'banners', (state, action) => { 
            state.banners.push(action.payload); 
            state.hasFetchedBanners = true;
        });
        
        buildAsyncReducers(builder, updateBanner, 'banners', (state, action) => {
            const index = state.banners.findIndex((b: Banner) => b._id === action.payload._id);
            if (index !== -1) state.banners[index] = action.payload;
            state.hasFetchedBanners = true;
        });
        
        buildAsyncReducers(builder, deleteBanner, 'banners', (state, action) => {
            state.banners = state.banners.filter((b: Banner) => b._id !== action.payload);
            state.hasFetchedBanners = true;
        });

        // Popular Collections
        buildAsyncReducers(builder, fetchPopularCollectionsContent, 'popularCollections', (state, action) => { 
            state.popularCollections = action.payload; 
            state.hasFetchedPopularCollections = true;
        });
        buildAsyncReducers(builder, fetchAdminPopularCollections, 'popularCollections', (state, action) => { 
            state.popularCollections = action.payload; 
            state.hasFetchedPopularCollections = true;
        });
        buildAsyncReducers(builder, updatePopularCollections, 'popularCollections', (state, action) => { 
            state.popularCollections = action.payload; 
            state.hasFetchedPopularCollections = true;
        });

        // Global Settings
        buildAsyncReducers(builder, fetchGlobalSettings, 'globalSettings', (state, action) => { 
            state.globalSettings = action.payload; 
        });
        buildAsyncReducers(builder, updateGlobalSettings, 'globalSettings', (state, action) => { 
            state.globalSettings = action.payload; 
        });

        // Home Settings
        buildAsyncReducers(builder, fetchHomeSettings, 'homeSettings', (state, action) => { 
            state.homeSettings = action.payload; 
        });
        buildAsyncReducers(builder, fetchAdminHomeSettings, 'homeSettings', (state, action) => { 
            state.homeSettings = action.payload; 
        });
        buildAsyncReducers(builder, updateHomeSettings, 'homeSettings', (state, action) => { 
            state.homeSettings = action.payload; 
        });

        // Product Settings
        buildAsyncReducers(builder, fetchProductSettings, 'productSettings', (state, action) => { 
            state.productSettings = action.payload; 
        });
        buildAsyncReducers(builder, fetchAdminProductSettings, 'productSettings', (state, action) => { 
            state.productSettings = action.payload; 
        });
        buildAsyncReducers(builder, updateProductSettings, 'productSettings', (state, action) => { 
            state.productSettings = action.payload; 
        });

        // About Settings
        buildAsyncReducers(builder, fetchAboutSettings, 'aboutSettings', (state, action) => { 
            state.aboutSettings = action.payload; 
        });
        buildAsyncReducers(builder, fetchAdminAboutSettings, 'aboutSettings', (state, action) => { 
            state.aboutSettings = action.payload; 
        });
        buildAsyncReducers(builder, updateAboutSettings, 'aboutSettings', (state, action) => { 
            state.aboutSettings = action.payload; 
        });

        // Contact Settings
        buildAsyncReducers(builder, fetchContactSettings, 'contactSettings', (state, action) => { 
            state.contactSettings = action.payload; 
        });
        buildAsyncReducers(builder, fetchAdminContactSettings, 'contactSettings', (state, action) => { 
            state.contactSettings = action.payload; 
        });
        buildAsyncReducers(builder, updateContactSettings, 'contactSettings', (state, action) => { 
            state.contactSettings = action.payload; 
        });

        // Auth Settings
        buildAsyncReducers(builder, fetchAuthSettings, 'authSettings', (state, action) => { 
            state.authSettings = action.payload; 
        });
        buildAsyncReducers(builder, fetchAdminAuthSettings, 'authSettings', (state, action) => { 
            state.authSettings = action.payload; 
        });
        buildAsyncReducers(builder, updateAuthSettings, 'authSettings', (state, action) => { 
            state.authSettings = action.payload; 
        });

        // Legal Settings
        buildAsyncReducers(builder, fetchLegalSettings, 'legalSettings', (state, action) => {
            if (action.payload.content) {
                if (action.payload.type === 'privacy_policy') state.privacySettings = action.payload.content;
                else if (action.payload.type === 'terms_of_service') state.termsSettings = action.payload.content;
                else if (action.payload.type === 'accessibility') state.accessibilitySettings = action.payload.content;
            }
        });
        buildAsyncReducers(builder, updateLegalSettings, 'legalSettings', (state, action) => {
            if (action.payload.type === 'privacy_policy') state.privacySettings = action.payload.content;
            else if (action.payload.type === 'terms_of_service') state.termsSettings = action.payload.content;
            else if (action.payload.type === 'accessibility') state.accessibilitySettings = action.payload.content;
        });
    },
});

export const { clearError, hydrateContent } = contentSlice.actions;
export default contentSlice.reducer;
