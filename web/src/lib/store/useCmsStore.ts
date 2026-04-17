import { create } from 'zustand';
import { CustomPage } from '@/types/page';
import { ComponentInstance, ComponentPayload } from '@/types/component';
import { pageService } from '../services/pageService';
import { componentService } from '../services/componentService';

interface CmsState {
    pages: CustomPage[];
    instances: ComponentInstance[];
    currentPage: CustomPage | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchPages: () => Promise<CustomPage[]>;
    fetchPageBySlug: (slug: string) => Promise<CustomPage | null>;
    createPage: (data: Partial<CustomPage>) => Promise<CustomPage>;
    updatePage: (id: string, data: Partial<CustomPage>) => Promise<CustomPage>;
    deletePage: (id: string) => Promise<void>;
    
    fetchInstances: (type?: string) => Promise<void>;
    createInstance: (payload: ComponentPayload) => Promise<ComponentInstance>;
    updateInstance: (id: string, data: Record<string, unknown>) => Promise<ComponentInstance>;
    deleteInstance: (id: string) => Promise<void>;
    
    hydratePage: (page: CustomPage) => void;
    setInstances: (instances: ComponentInstance[]) => void;
    clearError: () => void;
}

export const useCmsStore = create<CmsState>((set, get) => ({
    pages: [],
    instances: [],
    currentPage: null,
    isLoading: false,
    error: null,

    fetchPages: async () => {
        set({ isLoading: true, error: null });
        try {
            const pages = await pageService.fetchPages();
            set({ pages, isLoading: false });
            return pages;
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch pages', isLoading: false });
            return [];
        }
    },

    fetchPageBySlug: async (slug: string) => {
        set({ isLoading: true, error: null });
        try {
            const page = await pageService.fetchPageBySlug(slug);
            set({ currentPage: page, isLoading: false });
            return page;
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch page', isLoading: false });
            return null;
        }
    },

    createPage: async (data: Partial<CustomPage>) => {
        set({ isLoading: true, error: null });
        try {
            const newPage = await pageService.createPage(data);
            set((state) => ({ 
                pages: [...state.pages, newPage],
                isLoading: false 
            }));
            return newPage;
        } catch (error: any) {
            set({ error: error.message || 'Failed to create page', isLoading: false });
            throw error;
        }
    },

    updatePage: async (id: string, data: Partial<CustomPage>) => {
        set({ isLoading: true, error: null });
        try {
            const updatedPage = await pageService.updatePage(id, data);
            set((state) => ({
                pages: state.pages.map(p => p._id === id ? updatedPage : p),
                currentPage: state.currentPage?._id === id ? updatedPage : state.currentPage,
                isLoading: false
            }));
            return updatedPage;
        } catch (error: any) {
            set({ error: error.message || 'Failed to update page', isLoading: false });
            throw error;
        }
    },

    deletePage: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await pageService.deletePage(id);
            set((state) => ({
                pages: state.pages.filter(p => p._id !== id),
                currentPage: state.currentPage?._id === id ? null : state.currentPage,
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to delete page', isLoading: false });
            throw error;
        }
    },

    fetchInstances: async (type?: string) => {
        set({ isLoading: true, error: null });
        try {
            const instances = await componentService.fetchComponentInstances(type);
            set({ instances, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch instances', isLoading: false });
        }
    },

    createInstance: async (payload: ComponentPayload) => {
        set({ isLoading: true, error: null });
        try {
            const newInstance = await componentService.createComponentInstance(payload);
            set((state) => ({
                instances: [...state.instances, newInstance],
                isLoading: false
            }));
            return newInstance;
        } catch (error: any) {
            set({ error: error.message || 'Failed to create instance', isLoading: false });
            throw error;
        }
    },

    updateInstance: async (id: string, data: Record<string, unknown>) => {
        set({ isLoading: true, error: null });
        try {
            const updatedInstance = await componentService.updateComponentInstance(id, data);
            set((state) => ({
                instances: state.instances.map(i => i._id === id ? updatedInstance : i),
                isLoading: false
            }));
            return updatedInstance;
        } catch (error: any) {
            set({ error: error.message || 'Failed to update instance', isLoading: false });
            throw error;
        }
    },

    deleteInstance: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await componentService.deleteComponentInstance(id);
            set((state) => ({
                instances: state.instances.filter(i => i._id !== id),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message || 'Failed to delete instance', isLoading: false });
            throw error;
        }
    },

    hydratePage: (page: CustomPage) => {
        set({ currentPage: page });
    },

    setInstances: (instances) => set({ instances }),
    clearError: () => set({ error: null })
}));
