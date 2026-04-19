import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
    GlobalSettings, 
    HomeSettings, 
    ProductSettings, 
    AboutSettings, 
    ContactSettings, 
    AuthSettings, 
    LegalSettings,
    Banner,
    PopularCollectionsContent
} from '@/types/content';
import { contentService } from '../services/contentService';

type LegalSettingsKey = 'privacy_policy' | 'terms_of_service' | 'accessibility';
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const noopStorage: StorageLike = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
};

function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred';
}

function isLegalSettingsKey(type: string): type is LegalSettingsKey {
    return type === 'privacy_policy' || type === 'terms_of_service' || type === 'accessibility';
}

interface ContentState {
    globalSettings: GlobalSettings | null;
    homeSettings: HomeSettings | null;
    productSettings: ProductSettings | null;
    aboutSettings: AboutSettings | null;
    contactSettings: ContactSettings | null;
    authSettings: AuthSettings | null;
    legalSettings: Partial<Record<LegalSettingsKey, LegalSettings>>;
    popularCollections: PopularCollectionsContent | null;
    banners: Banner[];
    hasFetchedBanners: boolean;
    hasFetchedPopularCollections: boolean;
    isLoading: boolean;
    error: string | null;
    hasLoadedOnce: boolean;

    // Actions
    fetchBanners: (forceRefresh?: boolean) => Promise<void>;
    fetchAdminBanners: () => Promise<void>;
    createBanner: (data: Partial<Banner>) => Promise<Banner>;
    updateBanner: (id: string, data: Partial<Banner>) => Promise<Banner>;
    deleteBanner: (id: string) => Promise<string>;
    fetchSettings: (forceRefresh?: boolean) => Promise<void>;
    fetchPopularCollections: (admin?: boolean) => Promise<void>;
    fetchPopularCollectionsContent: (admin?: boolean) => Promise<void>;
    updatePopularCollections: (content: PopularCollectionsContent) => Promise<void>;
    setGlobalSettings: (settings: GlobalSettings | null) => void;
    updateGlobalSettings: (settings: GlobalSettings) => Promise<void>;
    
    fetchHomeSettings: (admin?: boolean) => Promise<void>;
    updateHomeSettings: (settings: HomeSettings) => Promise<void>;
    
    fetchProductSettings: (admin?: boolean) => Promise<void>;
    updateProductSettings: (settings: ProductSettings) => Promise<void>;
    
    fetchAboutSettings: (admin?: boolean) => Promise<void>;
    updateAboutSettings: (settings: AboutSettings) => Promise<void>;
    
    fetchContactSettings: (admin?: boolean) => Promise<void>;
    updateContactSettings: (settings: ContactSettings) => Promise<void>;
    
    fetchAuthSettings: (admin?: boolean) => Promise<void>;
    updateAuthSettings: (settings: AuthSettings) => Promise<void>;
    
    setHomeSettings: (settings: HomeSettings | null) => void;
    setProductSettings: (settings: ProductSettings | null) => void;
    setAboutSettings: (settings: AboutSettings | null) => void;
    setContactSettings: (settings: ContactSettings | null) => void;
    setAuthSettings: (settings: AuthSettings | null) => void;
    setBanners: (banners: Banner[]) => void;
    setPopularCollections: (content: PopularCollectionsContent | null) => void;

    fetchLegalSettings: (type: string, forceRefresh?: boolean) => Promise<void>;
    updateLegalSettings: (type: string, content: LegalSettings) => Promise<void>;

    setLoading: (status: boolean) => void;
    clearError: () => void;
}

export const useContentStore = create<ContentState>()(
    persist(
        (set, get) => ({
            globalSettings: null,
            homeSettings: null,
            productSettings: null,
            aboutSettings: null,
            contactSettings: null,
            authSettings: null,
            legalSettings: {},
            popularCollections: null,
            banners: [],
            hasFetchedBanners: false,
            hasFetchedPopularCollections: false,
            isLoading: false,
            error: null,
            hasLoadedOnce: false,

            fetchSettings: async (forceRefresh = false) => {
                if (get().hasLoadedOnce && !forceRefresh) return;
                set({ isLoading: true });
                try {
                    const settings = await contentService.fetchGlobalSettings(forceRefresh);
                    set({ globalSettings: settings, hasLoadedOnce: true, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                }
            },

            setGlobalSettings: (settings) => set({ globalSettings: settings, hasLoadedOnce: true }),

            setBanners: (banners) => set({ banners, hasFetchedBanners: true }),
            fetchBanners: async (forceRefresh = false) => {
                if (get().hasFetchedBanners && !forceRefresh) return;
                set({ isLoading: true });
                try {
                    const banners = await contentService.fetchBanners(forceRefresh);
                    set({ banners, hasFetchedBanners: true, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                }
            },

            fetchAdminBanners: async () => {
                set({ isLoading: true });
                try {
                    const banners = await contentService.fetchAdminBanners();
                    set({ banners, hasFetchedBanners: true, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                }
            },

            createBanner: async (data) => {
                set({ isLoading: true });
                try {
                    const newBanner = await contentService.createBanner(data);
                    set((state) => ({ 
                        banners: [...state.banners, newBanner], 
                        isLoading: false 
                    }));
                    return newBanner;
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                    throw error;
                }
            },

            updateBanner: async (id, data) => {
                set({ isLoading: true });
                try {
                    const updatedBanner = await contentService.updateBanner(id, data);
                    set((state) => ({ 
                        banners: state.banners.map(b => b._id === id ? updatedBanner : b), 
                        isLoading: false 
                    }));
                    return updatedBanner;
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                    throw error;
                }
            },

            deleteBanner: async (id) => {
                set({ isLoading: true });
                try {
                    await contentService.deleteBanner(id);
                    set((state) => ({ 
                        banners: state.banners.filter(b => b._id !== id), 
                        isLoading: false 
                    }));
                    return id;
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                    throw error;
                }
            },

            updateGlobalSettings: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updateGlobalSettings(settings);
                    set({ globalSettings: settings, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                    throw error;
                }
            },

            setPopularCollections: (content) => set({ popularCollections: content, hasFetchedPopularCollections: true }),
            fetchPopularCollections: async (admin = false) => {
                set({ isLoading: true });
                try {
                    const data = admin ? await contentService.fetchAdminPopularCollections() : await contentService.fetchPopularCollections();
                    set({ popularCollections: data, hasFetchedPopularCollections: true, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                }
            },

            fetchPopularCollectionsContent: async (admin = false) => {
                const getBound = useContentStore.getState;
                await getBound().fetchPopularCollections(admin);
            },

            updatePopularCollections: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updatePopularCollections(settings);
                    set({ popularCollections: settings, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                    throw error;
                }
            },

            setHomeSettings: (settings) => set({ homeSettings: settings }),
            fetchHomeSettings: async (admin = false) => {
                set({ isLoading: true });
                try {
                    const data = admin ? await contentService.fetchAdminHomeSettings() : await contentService.fetchHomeSettings();
                    set({ homeSettings: data, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                }
            },

            updateHomeSettings: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updateHomeSettings(settings);
                    set({ homeSettings: settings, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                    throw error;
                }
            },

            setProductSettings: (settings) => set({ productSettings: settings }),
            fetchProductSettings: async (admin = false) => {
                set({ isLoading: true });
                try {
                    const data = admin ? await contentService.fetchAdminProductSettings() : await contentService.fetchProductSettings();
                    set({ productSettings: data, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                }
            },

            updateProductSettings: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updateProductSettings(settings);
                    set({ productSettings: settings, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                    throw error;
                }
            },

            setAboutSettings: (settings) => set({ aboutSettings: settings }),
            fetchAboutSettings: async (admin = false) => {
                set({ isLoading: true });
                try {
                    const data = admin ? await contentService.fetchAdminAboutSettings() : await contentService.fetchAboutSettings();
                    set({ aboutSettings: data, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                }
            },

            updateAboutSettings: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updateAboutSettings(settings);
                    set({ aboutSettings: settings, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                    throw error;
                }
            },

            setContactSettings: (settings) => set({ contactSettings: settings }),
            fetchContactSettings: async (admin = false) => {
                set({ isLoading: true });
                try {
                    const data = admin ? await contentService.fetchAdminContactSettings() : await contentService.fetchContactSettings();
                    set({ contactSettings: data, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                }
            },

            updateContactSettings: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updateContactSettings(settings);
                    set({ contactSettings: settings, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                    throw error;
                }
            },

            setAuthSettings: (settings) => set({ authSettings: settings }),
            fetchAuthSettings: async (admin = false) => {
                set({ isLoading: true });
                try {
                    const data = admin ? await contentService.fetchAdminAuthSettings() : await contentService.fetchAuthSettings();
                    set({ authSettings: data, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                }
            },

            updateAuthSettings: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updateAuthSettings(settings);
                    set({ authSettings: settings, isLoading: false });
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                    throw error;
                }
            },

            fetchLegalSettings: async (type: string, forceRefresh: boolean = false) => {
                if (!isLegalSettingsKey(type)) {
                    set({ error: `Unknown legal settings type: ${type}` });
                    return;
                }
                set({ isLoading: true });
                try {
                    const data = await contentService.fetchLegalSettings(type, forceRefresh);
                    set((state) => ({ 
                        legalSettings: { ...state.legalSettings, [type]: data.content }, 
                        isLoading: false 
                    }));
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                }
            },

            updateLegalSettings: async (type: string, content: LegalSettings) => {
                if (!isLegalSettingsKey(type)) {
                    throw new Error(`Unknown legal settings type: ${type}`);
                }
                set({ isLoading: true });
                try {
                    await contentService.updateLegalSettings(type, content);
                    set((state) => ({ 
                        legalSettings: { ...state.legalSettings, [type]: content }, 
                        isLoading: false 
                    }));
                } catch (error: unknown) {
                    set({ error: getErrorMessage(error), isLoading: false });
                    throw error;
                }
            },

            setLoading: (isLoading) => set({ isLoading }),
            clearError: () => set({ error: null })
        }),
        {
            name: 'content-storage',
            storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : noopStorage)),
            partialize: (state) => ({ 
                globalSettings: state.globalSettings,
                hasLoadedOnce: state.hasLoadedOnce
            }),
        }
    )
);
