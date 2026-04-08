import api from '../api';
import { fetchWithCache } from '../utils/apiCache';
import { DEFAULT_GLOBAL_SETTINGS } from '../../config/site-defaults.config';
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

// --- Service Methods ---

export const contentService = {
    // 1. Bootstrap
    fetchBootstrap: async (forceRefresh?: boolean) => {
        return await fetchWithCache(
            'bootstrap_config',
            async () => {
                const response = await api.get('/public/section-content/bootstrap');
                if (response.data.success) return response.data.data;
                throw new Error(response.data.message);
            },
            1,
            forceRefresh
        );
    },

    // 2. Banners
    fetchBanners: async (forceRefresh?: boolean) => {
        return await fetchWithCache(
            'banners',
            async () => {
                const response = await api.get('/public/banners');
                if (response.data.success) return response.data.data;
                throw new Error(response.data.message);
            },
            1,
            forceRefresh
        );
    },

    fetchAdminBanners: async () => {
        const response = await api.get('/banners');
        if (response.data.success) return response.data.data;
        throw new Error(response.data.message);
    },

    createBanner: async (data: Partial<Banner>) => {
        const response = await api.post('/banners', data);
        if (response.data.success) return response.data.data;
        throw new Error(response.data.message);
    },

    updateBanner: async (id: string, data: Partial<Banner>) => {
        const response = await api.put(`/banners/${id}`, data);
        if (response.data.success) return response.data.data;
        throw new Error(response.data.message);
    },

    deleteBanner: async (id: string) => {
        const response = await api.delete(`/banners/${id}`);
        if (response.data.success) return id;
        throw new Error(response.data.message);
    },

    // 3. Popular Collections
    fetchPopularCollections: async (forceRefresh?: boolean) => {
        return await fetchWithCache(
            'popular_collections_content',
            async () => {
                const response = await api.get('/public/section-content/popular_collections');
                if (response.data.success && response.data.data.content) return response.data.data.content;
                throw new Error(response.data.message);
            },
            30,
            forceRefresh
        );
    },

    fetchAdminPopularCollections: async () => {
        const response = await api.get('/section-content/popular_collections');
        if (response.data.success && response.data.data.content) return response.data.data.content;
        throw new Error(response.data.message);
    },

    updatePopularCollections: async (content: PopularCollectionsContent) => {
        const response = await api.put('/section-content/popular_collections', { content });
        if (response.data.success) return content;
        throw new Error(response.data.message);
    },

    // 4. Global Settings
    fetchGlobalSettings: async (forceRefresh?: boolean) => {
        return await fetchWithCache(
            'global_settings',
            async () => {
                const response = await api.get('/public/section-content/global_settings');
                const content = response.data?.data?.content;
                if (response.data.success && content && Object.keys(content).length > 0) {
                    return { ...DEFAULT_GLOBAL_SETTINGS, ...content };
                }
                return DEFAULT_GLOBAL_SETTINGS;
            },
            1,
            forceRefresh
        );
    },

    updateGlobalSettings: async (content: GlobalSettings) => {
        const response = await api.put('/section-content/global_settings', { content });
        if (response.data.success) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('alceix_cache_global_settings');
                localStorage.removeItem('alceix_cache_admin_global_settings');
            }
            return content;
        }
        throw new Error(response.data.message);
    },

    // 5. Home Settings
    fetchHomeSettings: async (forceRefresh?: boolean) => {
        return await fetchWithCache(
            'home_settings',
            async () => {
                const response = await api.get('/public/section-content/home_settings');
                const content = response.data?.data?.content;
                if (response.data.success && content && Object.keys(content).length > 0) {
                    return {
                        ...content,
                        sectionOrder: content.sectionOrder || [],
                        hiddenSections: content.hiddenSections || []
                    };
                }
                return { sectionOrder: [], hiddenSections: [] };
            },
            1,
            forceRefresh
        );
    },

    fetchAdminHomeSettings: async () => {
        const response = await api.get('/section-content/home_settings');
        const content = response.data?.data?.content;
        if (response.data.success && content && Object.keys(content).length > 0) {
            return {
                ...content,
                sectionOrder: content.sectionOrder || [],
                hiddenSections: content.hiddenSections || []
            };
        }
        return { sectionOrder: [], hiddenSections: [] };
    },

    updateHomeSettings: async (content: HomeSettings) => {
        const response = await api.put('/section-content/home_settings', { content });
        if (response.data.success) {
            if (typeof window !== 'undefined') localStorage.removeItem('alceix_cache_home_settings');
            return content;
        }
        throw new Error(response.data.message);
    },

    // 6. Product Settings
    fetchProductSettings: async (forceRefresh?: boolean) => {
        return await fetchWithCache(
            'product_settings',
            async () => {
                const response = await api.get('/public/section-content/product_settings');
                const content = response.data?.data?.content;
                if (response.data.success && content && Object.keys(content).length > 0) return content;
                return { sectionOrder: [], hiddenSections: [] };
            },
            1,
            forceRefresh
        );
    },

    fetchAdminProductSettings: async () => {
        const response = await api.get('/section-content/product_settings');
        const content = response.data?.data?.content;
        if (response.data.success && content && Object.keys(content).length > 0) return content;
        return { sectionOrder: [], hiddenSections: [] };
    },

    updateProductSettings: async (content: ProductSettings) => {
        const response = await api.put('/section-content/product_settings', { content });
        if (response.data.success) {
            if (typeof window !== 'undefined') localStorage.removeItem('alceix_cache_product_settings');
            return content;
        }
        throw new Error(response.data.message);
    },

    // 7. About Settings
    fetchAboutSettings: async (forceRefresh?: boolean) => {
        return await fetchWithCache(
            'about_settings',
            async () => {
                const response = await api.get('/public/section-content/about_settings');
                const content = response.data?.data?.content;
                if (response.data.success && content && Object.keys(content).length > 0) return content;
                return { sectionOrder: [], hiddenSections: [] };
            },
            1,
            forceRefresh
        );
    },

    fetchAdminAboutSettings: async () => {
        const response = await api.get('/section-content/about_settings');
        const content = response.data?.data?.content;
        if (response.data.success && content && Object.keys(content).length > 0) return content;
        return { sectionOrder: [], hiddenSections: [] };
    },

    updateAboutSettings: async (content: AboutSettings) => {
        const response = await api.put('/section-content/about_settings', { content });
        if (response.data.success) {
            if (typeof window !== 'undefined') localStorage.removeItem('alceix_cache_about_settings');
            return content;
        }
        throw new Error(response.data.message);
    },

    // 8. Contact Settings
    fetchContactSettings: async (forceRefresh?: boolean) => {
        return await fetchWithCache(
            'contact_settings',
            async () => {
                const response = await api.get('/public/section-content/contact_settings');
                const content = response.data?.data?.content;
                if (response.data.success && content && Object.keys(content).length > 0) return content;
                return { sectionOrder: [], hiddenSections: [] };
            },
            1,
            forceRefresh
        );
    },

    fetchAdminContactSettings: async () => {
        const response = await api.get('/section-content/contact_settings');
        const content = response.data?.data?.content;
        if (response.data.success && content && Object.keys(content).length > 0) return content;
        return { sectionOrder: [], hiddenSections: [] };
    },

    updateContactSettings: async (content: ContactSettings) => {
        const response = await api.put('/section-content/contact_settings', { content });
        if (response.data.success) {
            if (typeof window !== 'undefined') localStorage.removeItem('alceix_cache_contact_settings');
            return content;
        }
        throw new Error(response.data.message);
    },

    // 9. Auth Settings
    fetchAuthSettings: async (forceRefresh?: boolean) => {
        return await fetchWithCache(
            'auth_settings',
            async () => {
                const response = await api.get('/public/section-content/auth_settings');
                const content = response.data?.data?.content;
                if (response.data.success && content && Object.keys(content).length > 0) return content;
                return {
                    login: { layout: 'split-left', title: '', quote: '', imageUrl: '' },
                    register: { layout: 'split-left', title: '', quote: '', imageUrl: '' }
                };
            },
            1,
            forceRefresh
        );
    },

    fetchAdminAuthSettings: async () => {
        const response = await api.get('/section-content/auth_settings');
        const content = response.data?.data?.content;
        if (response.data.success && content && Object.keys(content).length > 0) return content;
        return {
            login: { layout: 'split-left', title: '', quote: '', imageUrl: '' },
            register: { layout: 'split-left', title: '', quote: '', imageUrl: '' }
        };
    },

    updateAuthSettings: async (content: AuthSettings) => {
        const response = await api.put('/section-content/auth_settings', { content });
        if (response.data.success) {
            if (typeof window !== 'undefined') localStorage.removeItem('alceix_cache_auth_settings');
            return content;
        }
        throw new Error(response.data.message);
    },

    // 10. Legal Settings
    fetchLegalSettings: async (type: string, forceRefresh?: boolean) => {
        return await fetchWithCache(
            type,
            async () => {
                const response = await api.get(`/public/section-content/${type}`);
                if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) {
                    return { type, content: response.data.data.content };
                }
                return { type, content: null };
            },
            1,
            forceRefresh
        );
    },

    updateLegalSettings: async (type: string, content: LegalSettings) => {
        const response = await api.put(`/section-content/${type}`, { content });
        if (response.data.success) {
            if (typeof window !== 'undefined') localStorage.removeItem(`alceix_cache_${type}`);
            return { type, content };
        }
        throw new Error(response.data.message);
    }
};
