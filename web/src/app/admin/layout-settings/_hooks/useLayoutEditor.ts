import { useState, useEffect, useCallback } from 'react';
import { FiLayout } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useTranslation, Translate } from '@/hooks/useTranslation';
import {
    fetchGlobalSettings,
    fetchAdminHomeSettings,
    fetchAdminPopularCollections,
    fetchAdminProductSettings,
    fetchAdminAboutSettings,
    fetchAdminContactSettings,
    updateContactSettings,
    fetchLegalSettings,
    fetchAdminAuthSettings,
    fetchAdminBanners
} from '@/lib/slices/contentSlice';
import {
    fetchPages,
    createPage,
    updatePage as updateBackendPage,
    deletePage as deleteBackendPage
} from '@/lib/slices/pageSlice';
import { fetchComponentInstances, createComponentInstance } from '@/lib/slices/componentSlice';
import { COMPONENTS } from '@/config/component-store.config';
import type { CustomPage, PageSection } from '@/types/page';
import { SYSTEM_SLUGS, getInitialSectionsConfig, MODAL_MAPPING_CONFIG, getPagesConfig, PAGE_CATEGORIES_CONFIG } from '../_config/layout-editor.config';



function getUnknownErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null) {
        const maybeMessage = 'message' in error ? (error as { message?: unknown }).message : undefined;
        if (typeof maybeMessage === 'string') return maybeMessage;
        const maybePayload = 'payload' in error ? (error as { payload?: unknown }).payload : undefined;
        if (typeof maybePayload === 'string') return maybePayload;
        const maybeError = 'error' in error ? (error as { error?: unknown }).error : undefined;
        if (typeof maybeError === 'string') return maybeError;
    }
    return '';
}

export function useLayoutEditor() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const tUnsafe = useCallback<Translate>((key, variables) => t(key, variables), [t]);

    // -- Redux State --
    const { pages } = useAppSelector((state) => state.pages);
    const {
        contactSettings,
        globalSettings
    } = useAppSelector((state) => state.content);
    const { instances } = useAppSelector((state) => state.component);

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
        dispatch(fetchGlobalSettings());
        dispatch(fetchAdminHomeSettings());
        dispatch(fetchAdminPopularCollections());
        dispatch(fetchComponentInstances(undefined));
        dispatch(fetchAdminBanners());
        dispatch(fetchPages());
    }, [dispatch]);

    useEffect(() => {
        switch (selectedPageId) {
            case 'product':
                dispatch(fetchAdminProductSettings());
                break;
            case 'about':
                dispatch(fetchAdminAboutSettings());
                break;
            case 'contact':
                dispatch(fetchAdminContactSettings());
                break;
            case 'login':
            case 'register':
                dispatch(fetchAdminAuthSettings());
                break;
            case 'privacy':
                dispatch(fetchLegalSettings({ type: 'privacy_policy' }));
                break;
            case 'terms':
                dispatch(fetchLegalSettings({ type: 'terms_of_service' }));
                break;
            case 'accessibility':
                dispatch(fetchLegalSettings({ type: 'accessibility' }));
                break;
            default:
                break;
        }
    }, [dispatch, selectedPageId]);

    // -- Section State Sync --
    useEffect(() => {
        if (!pages || pages.length === 0) return;

        const initial = getInitialSectionsConfig(tUnsafe);
        const newSectionsState: Record<string, PageSection[]> = { ...initial };

        pages.forEach((pageRecord: CustomPage) => {
            const pageId = pageRecord.slug === 'home' ? 'home' :
                pageRecord.slug === 'about' ? 'about' :
                    pageRecord.slug === 'contact' ? 'contact' :
                        pageRecord.slug === 'login' ? 'login' :
                            pageRecord.slug === 'register' ? 'register' :
                                pageRecord.slug === 'product-detail' ? 'product' :
                                    pageRecord.slug === 'privacy-policy' ? 'privacy' :
                                        pageRecord.slug === 'terms-of-service' ? 'terms' :
                                            pageRecord.slug === 'accessibility' ? 'accessibility' :
                                                pageRecord.slug === 'categories' ? 'categories' :
                                                    pageRecord.slug === 'collections' ? 'categories' :
                                                        pageRecord.slug === 'journal' ? 'journal' :
                                                            pageRecord.slug === 'journal-detail' ? 'journal-detail' :
                                                                pageRecord._id;

            if (pageRecord.sections) {
                newSectionsState[pageId] = pageRecord.sections.map((sec) => {
                    const id = typeof sec === 'string' ? sec : sec.id;
                    const isActive = typeof sec === 'string' ? true : (sec.isActive ?? true);
                    const baseType = id.includes('_instance_') ? id.split('_instance_')[0] : id;

                    const componentDef = COMPONENTS.find(c => c.id === baseType);
                    const initialDef = Object.values(initial).flat().find(s => s.id === baseType);

                    return {
                        id: id,
                        label: componentDef ? tUnsafe(componentDef.titleKey) : (initialDef?.label || id),
                        description: componentDef ? tUnsafe(componentDef.descriptionKey) : (initialDef?.description || 'Section'),
                        isActive: isActive,
                        hasSettings: true
                    };
                });
            }
        });

        setSectionsState(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newSectionsState)) return prev;
            return newSectionsState;
        });
    }, [pages, tUnsafe]);

    // -- Handlers --

    const resolvePageSlug = useCallback((pageId: string, availablePages: CustomPage[] = pages) => {
        return pageId === 'home' ? 'home' :
            pageId === 'about' ? 'about' :
                pageId === 'contact' ? 'contact' :
                    pageId === 'login' ? 'login' :
                        pageId === 'register' ? 'register' :
                            pageId === 'product' ? 'product-detail' :
                                pageId === 'privacy' ? 'privacy-policy' :
                                    pageId === 'terms' ? 'terms-of-service' :
                                        pageId === 'accessibility' ? 'accessibility' :
                                            pageId === 'categories' ? 'categories' :
                                                pageId === 'journal' ? 'journal' :
                                                    pageId === 'journal-detail' ? 'journal-detail' :
                                                        availablePages.find((p) => p._id === pageId)?.slug;
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
        dispatch(fetchComponentInstances(undefined));
        switch (selectedPageId) {
            case 'home':
            case 'categories':
            case 'journal':
            case 'journal-detail':
                dispatch(fetchAdminHomeSettings());
                dispatch(fetchAdminBanners());
                dispatch(fetchAdminPopularCollections());
                break;
            case 'product':
                dispatch(fetchAdminProductSettings());
                break;
            case 'about':
                dispatch(fetchAdminAboutSettings());
                break;
            case 'contact':
                dispatch(fetchAdminContactSettings());
                break;
            case 'login':
            case 'register':
                dispatch(fetchAdminAuthSettings());
                break;
            case 'privacy':
                dispatch(fetchLegalSettings({ type: 'privacy_policy', forceRefresh: true }));
                break;
            case 'terms':
                dispatch(fetchLegalSettings({ type: 'terms_of_service', forceRefresh: true }));
                break;
            case 'accessibility':
                dispatch(fetchLegalSettings({ type: 'accessibility', forceRefresh: true }));
                break;
            default:
                break;
        }
        setRefreshKey(prev => prev + 1);
    }, [dispatch, selectedPageId]);

    const persistLayout = useCallback(async (pageId: string, updatedSections: PageSection[]) => {
        try {
            const slug = resolvePageSlug(pageId);
            if (!slug) return;

            let existingPage = pages.find(p => p.slug === slug);

            if (!existingPage) {
                const latestPages = await dispatch(fetchPages()).unwrap();
                const typedLatestPages = latestPages as unknown as CustomPage[];
                existingPage = typedLatestPages.find((page) => page.slug === slug);
            }

            if (existingPage) {
                await dispatch(updateBackendPage({
                    id: existingPage._id,
                    data: { sections: updatedSections }
                })).unwrap();
            } else {
                const systemLabels: Record<string, string> = {
                    'home': 'Home Page', 'about': 'About Us', 'contact': 'Contact',
                    'login': 'Login', 'register': 'Register', 'product-detail': 'Product Detail Layout',
                    'privacy-policy': 'Privacy Policy', 'terms-of-service': 'Terms of Service',
                    'accessibility': 'Accessibility', 'categories': 'Categories Catalog', 'collections': 'Collections Catalog'
                };
                try {
                    await dispatch(createPage({
                        title: systemLabels[slug] || slug,
                        slug: slug,
                        path: slug === 'home' ? '/' : `/${slug}`,
                        sections: updatedSections
                    })).unwrap();
                } catch (createError: unknown) {
                    const latestPages = await dispatch(fetchPages()).unwrap();
                    const typedLatestPages = latestPages as unknown as CustomPage[];
                    const recoveredPage = typedLatestPages.find((page) => page.slug === slug);

                    if (!recoveredPage) {
                        throw createError;
                    }

                    await dispatch(updateBackendPage({
                        id: recoveredPage._id,
                        data: { sections: updatedSections }
                    })).unwrap();
                }
            }
            triggerRefresh();
        } catch (e: unknown) {
            if (isTransientSaveError(e)) {
                try {
                    const latestPages = await dispatch(fetchPages()).unwrap();
                    const typedLatestPages = latestPages as unknown as CustomPage[];
                    const slug = resolvePageSlug(pageId, typedLatestPages);

                    if (!slug) return;

                    const recoveredPage = typedLatestPages.find((page) => page.slug === slug);
                    if (recoveredPage) {
                        await dispatch(updateBackendPage({
                            id: recoveredPage._id,
                            data: { sections: updatedSections }
                        })).unwrap();
                        triggerRefresh();
                        return;
                    }
                } catch (retryError) {
                    console.error(`Retry failed while persisting layout for ${pageId}:`, retryError);
                }
            }

            console.error(`Failed to persist layout for ${pageId}:`, e);
            alert(`Sayfa kaydedilirken hata oluştu: ${getUnknownErrorMessage(e) || 'Bilinmeyen hata'}`);
        }
    }, [pages, dispatch, isTransientSaveError, resolvePageSlug, triggerRefresh]);

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
            await dispatch(deleteBackendPage(pageId)).unwrap();
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
    }, [dispatch, selectedPageId, t, triggerRefresh]);

    const executeConversion = useCallback(async (sectionId: string, name: string) => {
        const finalSectionId = sectionId === 'contact_split_form' ? 'contact_form' :
            sectionId === 'contact_faq' ? 'contact_info' :
                sectionId;
        try {
            let initialData = {};
            if (selectedPageId === 'contact' && contactSettings) {
                if (finalSectionId === 'contact_hero' || finalSectionId === 'page_hero') initialData = contactSettings.hero || {};
                if (finalSectionId === 'contact_form') initialData = contactSettings.splitForm || {};
                if (finalSectionId === 'contact_info') initialData = contactSettings.faq || {};
            }

            const result = await dispatch(createComponentInstance({
                type: finalSectionId,
                name: name.trim(),
                data: initialData
            })).unwrap();

            const newInstanceId = result._id;
            const fullNewId = `${finalSectionId}_instance_${newInstanceId}`;

            if (selectedPageId === 'contact' && contactSettings?.sectionOrder) {
                const newOrder = contactSettings.sectionOrder.map(id => id === sectionId ? fullNewId : id);
                await dispatch(updateContactSettings({ ...contactSettings, sectionOrder: newOrder })).unwrap();
            }

            setActiveInstanceId(newInstanceId);
            setActiveModal(finalSectionId);
            triggerRefresh();
            return result;
        } catch (e) {
            console.error('Failed to convert to instance:', e);
            throw e;
        }
    }, [selectedPageId, contactSettings, dispatch, triggerRefresh]);

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

        const currentSections = sectionsState[selectedPageId] || [];
        const sectionExists = currentSections.some(s => s.id === sectionId);

        let newArray: PageSection[];
        if (sectionExists) {
            newArray = currentSections.map(section =>
                section.id === sectionId ? { ...section, isActive: true } : section
            );
        } else {
            const baseType = sectionId.includes('_instance_') ? sectionId.split('_instance_')[0] : sectionId;
            const allInitial = Object.values(getInitialSectionsConfig(tUnsafe)).flat();
            const definition = allInitial.find(s => s.id === baseType);

            if (definition) {
                newArray = [...currentSections, { ...definition, id: sectionId, isActive: true }];
            } else {
                newArray = [...currentSections, {
                    id: sectionId, label: sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace('_', ' '),
                    description: 'New Component', isActive: true, hasSettings: true
                }];
            }
        }

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
