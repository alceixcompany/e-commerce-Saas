import { useState, useEffect, useCallback } from 'react';
import { FiLayout } from 'react-icons/fi';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { CustomPage, PageSection } from '@/types/page';
import { SYSTEM_SLUGS, MODAL_MAPPING_CONFIG, getPagesConfig, PAGE_CATEGORIES_CONFIG } from '../_config/layout-editor.config';
import {
    buildSectionsState,
    fetchSettingsForSelectedPage,
    getUnknownErrorMessage,
    refreshDataForSelectedPage,
    resolvePageSlugFromId,
} from './layoutEditor.helpers';
import {
    buildSectionsAfterAdd,
    executeSectionConversion,
    formatPersistLayoutError,
    persistLayoutChange,
} from './layoutEditor.mutations';

export function useLayoutEditor() {
    const { t } = useTranslation();
    const tUnsafe = useCallback((key: string, variables?: Record<string, string | number>) => t(key as never, variables), [t]);

    // -- Zustand Stores --
    const { 
        pages, 
        instances, 
        fetchPages, 
        createPage: cmsCreatePage, 
        updatePage: cmsUpdatePage, 
        deletePage: cmsDeletePage,
        fetchInstances,
        createInstance
    } = useCmsStore();

    const {
        globalSettings,
        contactSettings,
        fetchSettings,
        fetchHomeSettings,
        fetchAboutSettings,
        fetchContactSettings,
        fetchProductSettings,
        fetchAuthSettings,
        fetchLegalSettings,
        updateContactSettings
    } = useContentStore();

    // -- Local State --
    const [selectedPageId, setSelectedPageId] = useState('home');
    const [sectionsState, setSectionsState] = useState<Record<string, PageSection[]>>({});
    const [sidebarView, setSidebarView] = useState<'pages' | 'sections'>('pages');
    const [refreshKey, setRefreshKey] = useState(0);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set(['general', 'core', 'catalog', 'auth', 'legal', 'custom']));

    // Modal & Action States
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [activeInstanceId, setActiveInstanceId] = useState<string | null>(null);
    const [isComponentStoreOpen, setIsComponentStoreOpen] = useState(false);
    const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
    const [newPageName, setNewPageName] = useState('');
    const [isComponentNameModalOpen, setIsComponentNameModalOpen] = useState(false);
    const [sectionToConvert, setSectionToConvert] = useState<string | null>(null);
    const [newInstanceName, setNewInstanceName] = useState('');

    // -- Global Data Fetching --
    useEffect(() => {
        fetchSettings();
        fetchHomeSettings(true); // admin mode
        fetchInstances();
        fetchPages();
    }, [fetchSettings, fetchHomeSettings, fetchInstances, fetchPages]);

    useEffect(() => {
        void fetchSettingsForSelectedPage(selectedPageId, {
            fetchProductSettings,
            fetchAboutSettings,
            fetchContactSettings,
            fetchAuthSettings,
            fetchLegalSettings,
        });
    }, [fetchProductSettings, fetchAboutSettings, fetchContactSettings, fetchAuthSettings, fetchLegalSettings, selectedPageId]);

    // -- Section State Sync --
    useEffect(() => {
        const newSectionsState = buildSectionsState(pages || [], tUnsafe);

        queueMicrotask(() => {
            setSectionsState(prev => {
                if (JSON.stringify(prev) === JSON.stringify(newSectionsState)) return prev;
                return newSectionsState;
            });
        });
    }, [pages, tUnsafe]);

    // -- Handlers --

    const resolvePageSlug = useCallback((pageId: string, availablePages: CustomPage[] = pages) => {
        return resolvePageSlugFromId(pageId, availablePages);
    }, [pages]);

    const isTransientSaveError = useCallback((error: unknown) => {
        const message = getUnknownErrorMessage(error);
        const normalized = String(message).toLowerCase();

        return normalized.includes('401') ||
            normalized.includes('unauthorized') ||
            normalized.includes('jwt expired') ||
            normalized.includes('token expired') ||
            normalized.includes('session expired') ||
            normalized.includes('network error') ||
            normalized.includes('timeout');
    }, []);

    const triggerRefresh = useCallback(() => {
        void refreshDataForSelectedPage(selectedPageId, {
            fetchInstances,
            fetchHomeSettings,
            fetchProductSettings,
            fetchAboutSettings,
            fetchContactSettings,
            fetchAuthSettings,
            fetchLegalSettings,
        });
        setRefreshKey(prev => prev + 1);
    }, [fetchInstances, fetchHomeSettings, fetchProductSettings, fetchAboutSettings, fetchContactSettings, fetchAuthSettings, fetchLegalSettings, selectedPageId]);

    const persistLayout = useCallback(async (pageId: string, updatedSections: PageSection[]) => {
        try {
            await persistLayoutChange({
                pageId,
                updatedSections,
                pages,
                fetchPages,
                resolvePageSlug,
                cmsUpdatePage,
                cmsCreatePage,
                triggerRefresh,
                isTransientSaveError,
            });
        } catch (error: unknown) {
            console.error(`Failed to persist layout for ${pageId}:`, error);
            alert(formatPersistLayoutError(error));
        }
    }, [pages, isTransientSaveError, resolvePageSlug, triggerRefresh, cmsUpdatePage, cmsCreatePage, fetchPages]);

    const toggleSection = useCallback(async (sectionId: string) => {
        const currentSections = sectionsState[selectedPageId] || [];
        const newArray = currentSections.map(section =>
            section.id === sectionId ? { ...section, isActive: !section.isActive } : section
        );
        setSectionsState(prev => ({ ...prev, [selectedPageId]: newArray }));
        await persistLayout(selectedPageId, newArray);
    }, [selectedPageId, sectionsState, persistLayout]);

    const handleRemoveSection = useCallback(async (sectionId: string) => {
        const currentSections = sectionsState[selectedPageId] || [];
        const newArray = currentSections.filter(section => section.id !== sectionId);
        setSectionsState(prev => ({ ...prev, [selectedPageId]: newArray }));
        await persistLayout(selectedPageId, newArray);
    }, [selectedPageId, sectionsState, persistLayout]);

    const handleDeletePage = useCallback(async (pageId: string) => {
        if (!window.confirm(t('admin.confirmDeletePage') || 'Bu sayfayı silmek istediğinizden emin misiniz?')) return;
        try {
            await cmsDeletePage(pageId);
            setSectionsState(prev => {
                const newState = { ...prev };
                delete newState[pageId];
                return newState;
            });
            if (selectedPageId === pageId) {
                setSelectedPageId('home');
                setSidebarView('pages');
            }
            triggerRefresh();
        } catch (error) {
            console.error('Failed to delete page:', error);
        }
    }, [selectedPageId, t, triggerRefresh, cmsDeletePage]);

    const executeConversion = useCallback(async (sectionId: string, name: string) => {
        try {
            return await executeSectionConversion({
                sectionId,
                name,
                selectedPageId,
                contactSettings,
                createInstance,
                updateContactSettings,
                triggerRefresh,
                setActiveInstanceId,
                setActiveModal,
            });
        } catch (e) {
            console.error('Failed to convert to instance:', e);
            throw e;
        }
    }, [selectedPageId, contactSettings, triggerRefresh, createInstance, updateContactSettings]);

    const handleEditSection = useCallback(async (sectionId: string) => {
        let finalSectionId = sectionId;
        let instanceId = null;

        if (sectionId.includes('_instance_')) {
            const parts = sectionId.split('_instance_');
            finalSectionId = parts[0];
            instanceId = parts[1];
        }

        let modalId = MODAL_MAPPING_CONFIG[finalSectionId];
        if (finalSectionId === 'auth') {
            modalId = selectedPageId === 'register' ? 'auth_register' : 'auth_login';
        }

        const contactStaticSections = ['contact_hero', 'contact_form', 'contact_info', 'contact_split_form', 'contact_faq'];
        if (selectedPageId === 'contact' && contactStaticSections.includes(finalSectionId) && !instanceId) {
            if (!contactSettings) return;
            const baseNames: Record<string, string> = {
                contact_hero: 'Page Hero', contact_form: 'Contact Form', contact_info: 'Contact Info'
            };
            const baseName = baseNames[finalSectionId] || finalSectionId;
            const count = instances.filter(i => i.type === finalSectionId).length;
            await executeConversion(sectionId, `${baseName} ${count + 1}`);
            return;
        }

        if (modalId) {
            setActiveInstanceId(instanceId);
            setActiveModal(modalId);
        }
    }, [selectedPageId, contactSettings, instances, executeConversion]);

    const handleAddFromStore = useCallback(async (sectionId: string) => {
        const allowedPages = ['home', 'product', 'about', 'contact', 'login', 'register', 'privacy', 'terms', 'accessibility', 'categories', 'journal', 'journal-detail', ...pages.map((p) => p._id)];
        if (!allowedPages.includes(selectedPageId)) return;

        const newArray = buildSectionsAfterAdd({
            sectionId,
            selectedPageId,
            sectionsState,
            pages,
            t: tUnsafe,
        });

        setSectionsState(prev => ({ ...prev, [selectedPageId]: newArray }));
        setIsComponentStoreOpen(false);
        await persistLayout(selectedPageId, newArray);
    }, [selectedPageId, pages, sectionsState, tUnsafe, persistLayout]);

    const handleDragEnd = useCallback(async (newSections: PageSection[]) => {
        setSectionsState(prev => ({ ...prev, [selectedPageId]: newSections }));
        await persistLayout(selectedPageId, newSections);
    }, [selectedPageId, persistLayout]);

    const handleConvertSave = useCallback(async () => {
        if (!sectionToConvert || !newInstanceName.trim()) return;

        try {
            await executeConversion(sectionToConvert, newInstanceName);
            setNewInstanceName('');
            setSectionToConvert(null);
            setIsComponentNameModalOpen(false);
        } catch (_error) {
            alert('Bileşen oluşturulurken bir hata oluştu.');
        }
    }, [sectionToConvert, newInstanceName, executeConversion, setIsComponentNameModalOpen, setNewInstanceName, setSectionToConvert]);

    // -- Derived State --
    const customPagesFromDb = pages.filter((p) => !SYSTEM_SLUGS.includes(p.slug));
    const allowedPages = ['home', 'product', 'about', 'contact', 'login', 'register', 'privacy', 'terms', 'accessibility', 'categories', 'journal', 'journal-detail', ...pages.map((p) => p._id)];

    const PAGES_LIST = [
        ...getPagesConfig(tUnsafe),
        ...customPagesFromDb.map((p) => ({
            id: p._id,
            label: p.title,
            path: p.path,
            icon: FiLayout,
            desc: p.description,
            category: 'custom'
        }))
    ];

    const groupedPages = PAGE_CATEGORIES_CONFIG(tUnsafe).map(cat => ({
        ...cat,
        pages: PAGES_LIST.filter(p => p.category === cat.id)
    })).filter(cat => cat.pages.length > 0);

    const selectedPage = PAGES_LIST.find(p => p.id === selectedPageId);
    const activeSections = sectionsState[selectedPageId] || [];

    const toggleCategory = useCallback((catId: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId);
            else next.add(catId);
            return next;
        });
    }, []);

    return {
        // State
        selectedPageId, setSelectedPageId,
        sectionsState, setSectionsState,
        sidebarView, setSidebarView,
        refreshKey,
        viewMode, setViewMode,
        collapsedCategories, setCollapsedCategories,
        activeModal, setActiveModal,
        activeInstanceId, setActiveInstanceId,
        isComponentStoreOpen, setIsComponentStoreOpen,
        isAddPageModalOpen, setIsAddPageModalOpen,
        newPageName, setNewPageName,
        isComponentNameModalOpen, setIsComponentNameModalOpen,
        sectionToConvert, setSectionToConvert,
        newInstanceName, setNewInstanceName,

        // Data
        pages, instances, contactSettings, globalSettings,
        groupedPages, selectedPage, activeSections, allowedPages,

        // Handlers
        triggerRefresh,
        persistLayout,
        toggleSection,
        handleRemoveSection,
        handleDeletePage,
        handleEditSection,
        handleAddFromStore,
        handleDragEnd,
        executeConversion,
        toggleCategory,
        handleConvertSave
    };
}
