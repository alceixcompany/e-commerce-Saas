import { publicServerFetch, publicServerFetchEnvelope, shouldFailOnCriticalPublicDataError } from '../api';
import { CustomPage } from '@/types/page';
import { AuthSettings, Banner, BootstrapConfig, LegalSettings, ProductSettings } from '@/types/content';
import { SectionContentPayload } from '../serviceTypes';
import { buildTaggedFetchOptions } from '../cache';

const REVALIDATE_INTERVAL = 60; // seconds

type BootstrapData = BootstrapConfig & {
    banners?: Banner[];
    pageData?: CustomPage;
};

export const serverContentService = {

    getPageBySlug: async (slug: string, preview = false): Promise<CustomPage | null> => {
        try {
            const response = await publicServerFetch<{ pageData: CustomPage }>(`/public/section-content/bootstrap?slug=${slug}`, {
                ...buildTaggedFetchOptions(['content', 'content:bootstrap', `content:page:${slug}`], REVALIDATE_INTERVAL, preview)
            });
            return response?.pageData || null;
        } catch (error) {
            console.error(`[serverContentService] Failed to fetch page "${slug}"`, error);
            if (shouldFailOnCriticalPublicDataError()) throw error;
            return null;
        }
    },

    listPublicPageSlugs: async (): Promise<string[]> => {
        try {
            const response = await publicServerFetchEnvelope<CustomPage[]>('/pages', {
                ...buildTaggedFetchOptions(['content', 'content:pages'], REVALIDATE_INTERVAL)
            });
            return (Array.isArray(response.data) ? response.data : []).map((page) => page.slug).filter(Boolean);
        } catch (error) {
            console.error('[serverContentService] Failed to list public pages', error);
            return [];
        }
    },

    getProductSettings: async (preview = false): Promise<ProductSettings | null> => {
        try {
            const response = await publicServerFetch<{ content: ProductSettings }>('/public/section-content/product_settings', {
                ...buildTaggedFetchOptions(['content', 'content:section:product_settings'], REVALIDATE_INTERVAL, preview)
            });
            return response?.content || null;
        } catch (error) {
            console.error('[serverContentService] Failed to fetch product settings', error);
            return null;
        }
    },
    
    getLegalSettings: async (type: string, preview = false): Promise<LegalSettings | null> => {
        try {
            const response = await publicServerFetch<SectionContentPayload<LegalSettings>>(`/public/section-content/${type}`, {
                ...buildTaggedFetchOptions(['content', `content:section:${type}`], REVALIDATE_INTERVAL, preview)
            });
            return response?.content || null;
        } catch (error) {
            console.error(`[serverContentService] Failed to fetch legal settings "${type}"`, error);
            return null;
        }
    },

    getBootstrapData: async (slug?: string, preview = false): Promise<BootstrapData | null> => {
        try {
            const url = slug ? `/public/section-content/bootstrap?slug=${slug}` : '/public/section-content/bootstrap';
            const response = await publicServerFetch<BootstrapData>(url, {
                ...buildTaggedFetchOptions(
                    ['content', 'content:bootstrap', ...(slug ? [`content:page:${slug}`] : [])],
                    REVALIDATE_INTERVAL,
                    preview
                )
            });
            return response ? { ...response, pageData: response.pageData ?? undefined } : null;
        } catch (error) {
            console.error(`[serverContentService] Failed to fetch bootstrap data${slug ? ` for "${slug}"` : ''}`, error);
            if (shouldFailOnCriticalPublicDataError()) throw error;
            return null;
        }
    },

    getAuthSettings: async (preview = false): Promise<AuthSettings | null> => {
        try {
            const response = await publicServerFetch<SectionContentPayload<AuthSettings>>('/public/section-content/auth_settings', {
                ...buildTaggedFetchOptions(['content', 'content:section:auth_settings'], REVALIDATE_INTERVAL, preview)
            });
            return response?.content || null;
        } catch (error) {
            console.error('[serverContentService] Failed to fetch auth settings', error);
            return null;
        }
    }
};
