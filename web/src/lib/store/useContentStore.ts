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

interface ContentState {
    globalSettings: GlobalSettings | null;
    homeSettings: HomeSettings | null;
    productSettings: ProductSettings | null;
    aboutSettings: AboutSettings | null;
    contactSettings: ContactSettings | null;
    authSettings: AuthSettings | null;
    legalSettings: Record<string, any>;
    popularCollections: PopularCollectionsContent | null;
    banners: Banner[];
    hasFetchedBanners: boolean;
    hasFetchedPopularCollections: boolean;
    isLoading: boolean & any; // Allow nested property access in transition
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
    
    fetchLegalSettings: (type: string, forceRefresh?: boolean) => Promise<void>;
    updateLegalSettings: (type: string, content: any) => Promise<void>;

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
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            setGlobalSettings: (settings) => set({ globalSettings: settings, hasLoadedOnce: true }),

            fetchBanners: async (forceRefresh = false) => {
                if (get().hasFetchedBanners && !forceRefresh) return;
                set({ isLoading: true });
                try {
                    const banners = await contentService.fetchBanners(forceRefresh);
                    set({ banners, hasFetchedBanners: true, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            fetchAdminBanners: async () => {
                set({ isLoading: true });
                try {
                    const banners = await contentService.fetchAdminBanners();
                    set({ banners, hasFetchedBanners: true, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
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
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
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
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
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
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            updateGlobalSettings: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updateGlobalSettings(settings);
                    set({ globalSettings: settings, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            fetchPopularCollections: async (admin = false) => {
                set({ isLoading: true });
                try {
                    const data = admin ? await contentService.fetchAdminPopularCollections() : await contentService.fetchPopularCollections();
                    set({ popularCollections: data, hasFetchedPopularCollections: true, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
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
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            fetchHomeSettings: async (admin = false) => {
                set({ isLoading: true });
                try {
                    const data = admin ? await contentService.fetchAdminHomeSettings() : await contentService.fetchHomeSettings();
                    set({ homeSettings: data, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updateHomeSettings: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updateHomeSettings(settings);
                    set({ homeSettings: settings, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            fetchProductSettings: async (admin = false) => {
                set({ isLoading: true });
                try {
                    const data = admin ? await contentService.fetchAdminProductSettings() : await contentService.fetchProductSettings();
                    set({ productSettings: data, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updateProductSettings: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updateProductSettings(settings);
                    set({ productSettings: settings, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            fetchAboutSettings: async (admin = false) => {
                set({ isLoading: true });
                try {
                    const data = admin ? await contentService.fetchAdminAboutSettings() : await contentService.fetchAboutSettings();
                    set({ aboutSettings: data, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updateAboutSettings: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updateAboutSettings(settings);
                    set({ aboutSettings: settings, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            fetchContactSettings: async (admin = false) => {
                set({ isLoading: true });
                try {
                    const data = admin ? await contentService.fetchAdminContactSettings() : await contentService.fetchContactSettings();
                    set({ contactSettings: data, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updateContactSettings: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updateContactSettings(settings);
                    set({ contactSettings: settings, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            fetchAuthSettings: async (admin = false) => {
                set({ isLoading: true });
                try {
                    const data = admin ? await contentService.fetchAdminAuthSettings() : await contentService.fetchAuthSettings();
                    set({ authSettings: data, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updateAuthSettings: async (settings) => {
                set({ isLoading: true });
                try {
                    await contentService.updateAuthSettings(settings);
                    set({ authSettings: settings, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            fetchLegalSettings: async (type, forceRefresh = false) => {
                set({ isLoading: true });
                try {
                    const data = await contentService.fetchLegalSettings(type, forceRefresh);
                    set((state) => ({ 
                        legalSettings: { ...state.legalSettings, [type]: data.content }, 
                        isLoading: false 
                    }));
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updateLegalSettings: async (type, content) => {
                set({ isLoading: true });
                try {
                    await contentService.updateLegalSettings(type, content);
                    set((state) => ({ 
                        legalSettings: { ...state.legalSettings, [type]: content }, 
                        isLoading: false 
                    }));
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            setLoading: (isLoading) => set({ isLoading }),
            clearError: () => set({ error: null })
        }),
        {
            name: 'content-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ 
                globalSettings: state.globalSettings,
                hasLoadedOnce: state.hasLoadedOnce
            }),
        }
    )
);
