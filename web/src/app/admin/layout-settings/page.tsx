'use client';

import { useState, useEffect } from 'react';
import {
    FiEdit2, FiPlus, FiX, FiColumns, FiGrid, FiSidebar,
    FiLayout, FiImage, FiSettings,
    FiMenu, FiGlobe, FiEye, FiEyeOff, FiMonitor, FiSmartphone,
    FiChevronLeft, FiChevronRight, FiSearch, FiPhone, FiStar, FiBook, FiMail, FiFilter, FiShoppingBag, FiLayers,
    FiHome, FiTag, FiMapPin, FiUser, FiList, FiDroplet, FiAward, FiLock, FiShield, FiActivity, FiTrash2, FiAlignLeft, FiInfo
} from 'react-icons/fi';
import { fetchComponentInstances, createComponentInstance } from '@/lib/slices/componentSlice';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
    fetchGlobalSettings,
    fetchAdminHomeSettings,
    fetchAdminPopularCollections,
    updateHomeSettings,
    fetchAdminProductSettings,
    updateProductSettings,
    fetchAdminAboutSettings,
    updateAboutSettings,
    fetchAdminContactSettings,
    updateContactSettings,
    updateLegalSettings,
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
import { COMPONENTS } from '@/config/component-store.config';
import { AnimatePresence } from 'framer-motion';
// --- Components ---
import GlobalSettingsEditorModal from './_components/Global/GlobalSettingsEditorModal';
import BannerEditorModal from './_components/Home/BannerEditorModal';
import CollectionsEditorModal from './_components/Home/CollectionsEditorModal';
import FeaturedSectionEditorModal from './_components/Home/FeaturedSectionEditorModal';
import CategoryLayoutEditorModal from './_components/Home/CategoryLayoutEditorModal';
import CategoryListingEditorModal from './_components/Home/CategoryListingEditorModal';
import PromoBannerSettingsModal from '@/app/admin/layout-settings/_components/Home/PromoBannerSettingsModal';
import ComponentStoreModal from './_components/Global/ComponentStoreModal';
import JournalEditorModal from './_components/Home/JournalEditorModal';
import AdvantageSectionEditorModal from './_components/Home/AdvantageSectionEditorModal';
import CampaignEditorModal from './_components/Home/CampaignEditorModal';
import ProductSettingsEditorModal from './_components/Product/ProductSettingsEditorModal';
import AboutHeroEditorModal from './_components/About/AboutHeroEditorModal';
import AboutAuthenticityEditorModal from './_components/About/AboutAuthenticityEditorModal';
import AboutShowcaseEditorModal from './_components/About/AboutShowcaseEditorModal';
import AboutPhilosophyEditorModal from './_components/About/AboutPhilosophyEditorModal';
import HeroEditorModal from './_components/Common/HeroEditorModal';
import ContactFormEditorModal from './_components/Contact/ContactFormEditorModal';
import ContactInfoEditorModal from './_components/Contact/ContactInfoEditorModal';
import AuthLayoutEditorModal from './_components/Auth/AuthLayoutEditorModal';
import LegalSettingsEditorModal from './_components/Global/LegalSettingsEditorModal';
import FAQEditorModal from './_components/Home/FAQEditorModal';
import ExploreRoomsEditorModal from './_components/Home/ExploreRoomsEditorModal';
import AboutUsEditorModal from './_components/Home/AboutUsEditorModal';
import CustomProductsEditorModal from './_components/Home/CustomProductsEditorModal';
import LegalContentEditorModal from './_components/Home/LegalContentEditorModal';

const SYSTEM_SLUGS = ['home', 'about', 'contact', 'login', 'register', 'product-detail', 'privacy-policy', 'terms-of-service', 'accessibility', 'categories', 'collections'];

// --- Types ---

interface PageSection {
    id: string;
    label: string;
    description: string;
    isActive: boolean;
    hasSettings: boolean; // Does it have a detail editor like Banners?
}

// --- Mock Data ---
// --- Mock Data ---
const getPages = (t: any) => [
    { id: 'global', label: t('admin.globalSettings'), path: '/', icon: FiSettings, desc: t('admin.pages.desc_global'), category: 'general' },
    { id: 'home', label: t('admin.homePage'), path: '/', icon: FiHome, desc: t('admin.pages.desc_home'), category: 'core' },
    { id: 'shop', label: t('admin.pages.shop'), path: '/cart', icon: FiShoppingBag, desc: t('admin.pages.desc_shop'), category: 'core' },
    { id: 'product', label: t('admin.pages.product'), path: '/products/demo', slug: 'product-detail', icon: FiTag, desc: t('admin.pages.desc_product'), category: 'core' },
    { id: 'about', label: t('navigation.about'), path: '/about', icon: FiUser, desc: t('admin.pages.desc_about'), category: 'core' },
    { id: 'contact', label: t('navigation.contact'), path: '/contact', icon: FiMapPin, desc: t('admin.pages.desc_contact'), category: 'core' },
    { id: 'login', label: t('common.login'), path: '/login', icon: FiLayout, desc: t('admin.pages.desc_login'), category: 'auth' },
    { id: 'register', label: t('common.register'), path: '/register', icon: FiLayout, desc: t('admin.pages.desc_register'), category: 'auth' },
    { id: 'privacy', label: t('admin.pages.privacy'), path: '/privacy-policy', icon: FiLock, desc: t('admin.pages.desc_privacy'), category: 'legal' },
    { id: 'terms', label: t('admin.pages.terms'), path: '/terms-of-service', icon: FiShield, desc: t('admin.pages.desc_terms'), category: 'legal' },
    { id: 'accessibility', label: t('admin.pages.accessibility'), path: '/accessibility', icon: FiActivity, desc: t('admin.pages.desc_accessibility'), category: 'legal' },
    { id: 'categories', label: t('admin.pages.categories') || 'Categories', path: '/categories', icon: FiGrid, desc: t('admin.pages.desc_categories') || 'Manage category listing page', category: 'catalog' },
];

const getInitialSections = (t: any): Record<string, PageSection[]> => ({
    global: [
        { id: 'identity', label: t('admin.sections.identity'), description: t('admin.sections.identity_desc'), isActive: true, hasSettings: true },
        { id: 'theme', label: t('admin.theme'), description: t('admin.sections.theme_desc'), isActive: true, hasSettings: true },
        { id: 'navbar', label: t('admin.navbar'), description: t('admin.sections.navbar_desc'), isActive: true, hasSettings: true },
        { id: 'footer_contact', label: t('admin.sections.footer_contact'), description: t('admin.sections.footer_contact_desc'), isActive: true, hasSettings: true },
        { id: 'seo', label: t('admin.seo'), description: t('admin.sections.seo_desc'), isActive: true, hasSettings: true },
    ],
    home: [],
    shop: [],
    product: [],
    about: [],
    contact: [],
    login: [],
    register: [],
    privacy: [],
    terms: [],
    accessibility: [],
    common: [
        { id: 'page_hero', label: t('admin.sections.hero'), description: t('admin.sections.hero_desc'), isActive: false, hasSettings: true },
        { id: 'contact_form', label: t('admin.sections.contact_form'), description: t('admin.sections.contact_form_desc'), isActive: false, hasSettings: true },
        { id: 'contact_info', label: t('admin.sections.contact_info'), description: t('admin.sections.contact_info_desc'), isActive: false, hasSettings: true },
        { id: 'faq', label: t('admin.sections.faq'), description: t('admin.sections.faq_desc'), isActive: false, hasSettings: true },
        { id: 'explore_rooms', label: t('admin.sections.explore_rooms'), description: t('admin.sections.explore_rooms_desc'), isActive: false, hasSettings: true },
        { id: 'about_us', label: t('admin.sections.about_us'), description: t('admin.sections.about_us_desc'), isActive: false, hasSettings: true },
        { id: 'custom_products', label: t('admin.sections.custom_products'), description: t('admin.sections.custom_products_desc'), isActive: false, hasSettings: true },
        { id: 'legal_content', label: t('admin.sections.legal_content'), description: t('admin.sections.legal_content_desc'), isActive: false, hasSettings: true },
        { id: 'auth', label: t('admin.sections.auth'), description: t('admin.sections.auth_desc'), isActive: false, hasSettings: true },
        { id: 'product_details', label: t('admin.sections.product_details'), description: t('admin.sections.product_details_desc'), isActive: false, hasSettings: true },
        { id: 'related_products', label: t('admin.sections.related_products'), description: t('admin.sections.related_products_desc'), isActive: false, hasSettings: true },
    ]
});

const SECTION_ICONS: Record<string, any> = {
    navbar: FiMenu,
    identity: FiGlobe,
    footer_contact: FiPhone,
    seo: FiSearch,
    hero: FiImage,
    featured: FiStar,
    popular: FiTag,
    collections: FiLayers,
    advantages: FiAward,
    campaigns: FiTag,
    banner: FiLayout,
    filters: FiFilter,
    grid: FiShoppingBag,
    about_hero: FiImage,
    about_authenticity: FiUser,
    about_showcase: FiMonitor,
    about_philosophy: FiBook,
    contact_hero: FiImage,
    contact_form: FiMail,
    contact_info: FiInfo,
    auth_login: FiLayout,
    auth_register: FiLayout,
    privacy_policy_edit: FiLock,
    terms_of_service_edit: FiShield,
    accessibility_edit: FiActivity,
    faq: FiAlignLeft,
    explore_rooms: FiSidebar,
    about_us: FiAward,
    custom_products: FiGrid,
    category_listing: FiGrid,
    legal_content: FiAlignLeft
};

// --- Main Component ---

export default function LayoutSettingsPage() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const [selectedPageId, setSelectedPageId] = useState('home');
    // Replace local state with Redux
    const { pages } = useAppSelector((state) => state.pages);
    const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
    const [newPageName, setNewPageName] = useState('');
    const [sectionsState, setSectionsState] = useState<Record<string, PageSection[]>>({});
    const [sidebarView, setSidebarView] = useState<'pages' | 'sections'>('pages');
    const [refreshKey, setRefreshKey] = useState(0);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set(['general', 'core', 'catalog', 'auth', 'legal', 'custom']));
    const [isComponentStoreOpen, setIsComponentStoreOpen] = useState(false);
    const [isComponentNameModalOpen, setIsComponentNameModalOpen] = useState(false);
    const [sectionToConvert, setSectionToConvert] = useState<string | null>(null);
    const [newInstanceName, setNewInstanceName] = useState('');

    // Modal States
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [activeInstanceId, setActiveInstanceId] = useState<string | null>(null);
    const { 
        homeSettings, 
        productSettings, 
        aboutSettings, 
        contactSettings, 
        authSettings, 
        privacySettings, 
        termsSettings, 
        accessibilitySettings, 
        globalSettings 
    } = useAppSelector((state) => state.content);
    const { instances } = useAppSelector((state) => state.component);

    // Fetch Global Settings on mount
    useEffect(() => {
        dispatch(fetchGlobalSettings());
        dispatch(fetchAdminHomeSettings());
        dispatch(fetchAdminPopularCollections());
        dispatch(fetchAdminProductSettings());
        dispatch(fetchAdminAboutSettings());
        dispatch(fetchAdminContactSettings());
        dispatch(fetchAdminAuthSettings());
        dispatch(fetchComponentInstances(undefined));
        dispatch(fetchAdminBanners());
        dispatch(fetchPages());
        dispatch(fetchLegalSettings({ type: 'privacy_policy' }));
        dispatch(fetchLegalSettings({ type: 'terms_of_service' }));
        dispatch(fetchLegalSettings({ type: 'accessibility' }));
    }, [dispatch]);

    // Initial load and sync
    useEffect(() => {
        if (!pages || pages.length === 0) return;

        const initial = getInitialSections(t);
        const newSectionsState: Record<string, PageSection[]> = { ...initial };

        // Process ALL pages (system and custom)
        const systemPageSlugs = ['home', 'about', 'contact', 'login', 'register', 'product-detail', 'privacy-policy', 'terms-of-service', 'accessibility', 'categories', 'collections'];
        
        pages.forEach((pageRecord: any) => {
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
                          pageRecord._id;

            if (pageRecord.sections) {
                newSectionsState[pageId] = pageRecord.sections.map((sec: any) => {
                    const id = typeof sec === 'string' ? sec : sec.id;
                    const isActive = typeof sec === 'string' ? true : (sec.isActive ?? true);
                    
                    const baseType = id.includes('_instance_') ? id.split('_instance_')[0] : id;
                    
                    // Lookup in COMPONENTS registry first, then fallback to initial defs
                    const componentDef = COMPONENTS.find(c => c.id === baseType);
                    const initialDef = Object.values(initial).flat().find(s => s.id === baseType);
                    
                    return {
                        id: id,
                        label: componentDef ? t(componentDef.titleKey as any) : (initialDef?.label || id),
                        description: componentDef ? t(componentDef.descriptionKey as any) : (initialDef?.description || 'Section'),
                        isActive: isActive,
                        hasSettings: true
                    };
                });
            }
        });

        // Only update if something changed to prevent loops
        setSectionsState(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newSectionsState)) return prev;
            return newSectionsState;
        });
    }, [pages, t]);

    const customPagesFromDb = pages.filter((p: any) => !SYSTEM_SLUGS.includes(p.slug));
    const allowedPages = ['home', 'product', 'about', 'contact', 'login', 'register', 'privacy', 'terms', 'accessibility', 'categories', ...pages.map((p: any) => p._id)];

    const PAGES_LIST = [...getPages(t), ...customPagesFromDb.map((p: any) => ({
        id: p._id,
        label: p.title,
        path: p.path,
        icon: FiLayout,
        desc: p.description,
        category: 'custom'
    }))];

    const categories = [
        { id: 'general', label: t('admin.groupCategories.general' as any) || (t('common.settings' as any) || 'Genel Ayarlar') },
        { id: 'core', label: t('admin.groupCategories.pages' as any) || (t('admin.mainPages' as any) || 'Ana Sayfalar') },
        { id: 'catalog', label: t('admin.groupCategories.catalog' as any) || (t('admin.explore' as any) || 'Katalog Menüsü') },
        { id: 'auth', label: t('admin.groupCategories.auth' as any) || (t('common.account' as any) || 'Üyelik Sayfaları') },
        { id: 'legal', label: t('admin.groupCategories.legal' as any) || (t('admin.pages.privacy' as any) || 'Bilgi & Yasal') },
        { id: 'custom', label: t('admin.groupCategories.custom' as any) || (t('admin.addPage' as any) || 'Ek Sayfalar') },
    ];

    const groupedPages = categories.map(cat => ({
        ...cat,
        pages: PAGES_LIST.filter(p => p.category === cat.id)
    })).filter(cat => cat.pages.length > 0);

    const toggleCategory = (catId: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId);
            else next.add(catId);
            return next;
        });
    };

    const selectedPage = PAGES_LIST.find(p => p.id === selectedPageId);
    const activeSections = sectionsState[selectedPageId] || [];

    // Auto-sync custom pages data to backend when state changes
    useEffect(() => {
        const customPage = pages.find((p: any) => p._id === selectedPageId);
        if (customPage) {
            const currentData = sectionsState[selectedPageId] || [];
            // Only sync if data has actually changed to avoid infinite loops
            if (JSON.stringify(currentData) !== JSON.stringify(customPage.sections)) {
                dispatch(updateBackendPage({ id: selectedPageId, data: { sections: currentData } }));
                
                // Trigger refresh for the preview iframe via storage event
                localStorage.setItem(`customPage_${customPage.slug}`, JSON.stringify(currentData));
                setRefreshKey(Date.now());
            }
        }
    }, [sectionsState, selectedPageId, pages, dispatch]);


    const persistLayout = async (pageId: string, updatedSections: PageSection[]) => {
        try {
            // Find corresponding slug for the pageId
            const slug = pageId === 'home' ? 'home' : 
                         pageId === 'about' ? 'about' : 
                         pageId === 'contact' ? 'contact' : 
                         pageId === 'login' ? 'login' : 
                         pageId === 'register' ? 'register' : 
                         pageId === 'product' ? 'product-detail' : 
                         pageId === 'privacy' ? 'privacy-policy' :
                         pageId === 'terms' ? 'terms-of-service' :
                         pageId === 'accessibility' ? 'accessibility' : 
                         pageId === 'categories' ? 'categories' :
                         pages.find(p => p._id === pageId)?.slug;

            console.log('PersistLayout DEBUG:', { pageId, slug, sectionsCount: updatedSections.length });

            if (!slug) return;

            // Find existing record in 'pages' collection
            const existingPage = pages.find(p => p.slug === slug);

            if (existingPage) {
                // Update existing Page record
                await dispatch(updateBackendPage({ 
                    id: existingPage._id, 
                    data: { sections: updatedSections } 
                })).unwrap();
            } else {
                // Auto-create system page if it doesn't exist
                const systemLabels: Record<string, string> = {
                    'home': 'Home Page',
                    'about': 'About Us',
                    'contact': 'Contact',
                    'login': 'Login',
                    'register': 'Register',
                    'product-detail': 'Product Detail Layout',
                    'privacy-policy': 'Privacy Policy',
                    'terms-of-service': 'Terms of Service',
                    'accessibility': 'Accessibility',
                    'categories': 'Categories Catalog',
                    'collections': 'Collections Catalog'
                };
                
                await dispatch(createPage({
                    title: systemLabels[slug] || slug,
                    slug: slug,
                    path: slug === 'home' ? '/' : `/${slug}`,
                    sections: updatedSections
                })).unwrap();
            }

            triggerRefresh(); // This will help bypass cache in preview
            // Optional: alert(t('admin.saveSuccess'));
        } catch (e: any) {
            console.error(`Failed to persist layout for ${pageId}:`, e);
            alert(`Sayfa kaydedilirken hata oluştu: ${e.message || 'Bilinmeyen hata'}`);
        }
    };

    const toggleSection = async (sectionId: string) => {
        const currentSections = sectionsState[selectedPageId] || [];
        const newArray = currentSections.map(section =>
            section.id === sectionId ? { ...section, isActive: !section.isActive } : section
        );

        setSectionsState(prev => ({ ...prev, [selectedPageId]: newArray }));
        await persistLayout(selectedPageId, newArray);
    };

    const handleRemoveSection = async (sectionId: string) => {
        const currentSections = sectionsState[selectedPageId] || [];
        const newArray = currentSections.filter(section => section.id !== sectionId);

        setSectionsState(prev => ({ ...prev, [selectedPageId]: newArray }));
        await persistLayout(selectedPageId, newArray);
    };
    
    const handleDeletePage = async (e: React.MouseEvent, pageId: string) => {
        e.stopPropagation();
        if (!window.confirm(t('admin.confirmDeletePage') || 'Bu sayfayı silmek istediğinizden emin misiniz?')) return;
        
        try {
            await dispatch(deleteBackendPage(pageId)).unwrap();
            
            setSectionsState(prev => {
                const newState = { ...prev };
                delete newState[pageId];
                return newState;
            });
            
            // If the deleted page was selected, switch to home
            if (selectedPageId === pageId) {
                setSelectedPageId('home');
                setSidebarView('pages');
            }
            
            triggerRefresh();
        } catch (error) {
            console.error('Failed to delete page:', error);
        }
    };

    const generateDefaultInstanceName = (type: string) => {
        const baseNames: Record<string, string> = {
            page_hero: 'Page Hero',
            contact_hero: 'Page Hero',
            contact_form: 'Contact Form',
            contact_info: 'Contact Info',
            contact_split_form: 'Contact Form',
            contact_faq: 'Contact Info'
        };
        const baseName = baseNames[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const count = instances.filter(i => i.type === (type === 'contact_split_form' ? 'contact_form' : type === 'contact_faq' ? 'contact_info' : type)).length;
        return `${baseName} ${count + 1}`;
    };

    const executeConversion = async (sectionId: string, name: string) => {
        const finalSectionId = sectionId === 'contact_split_form' ? 'contact_form' : 
                             sectionId === 'contact_faq' ? 'contact_info' : 
                             sectionId;

        const typeToCreate = finalSectionId;

        try {
            // Get current global data to seed the instance
            let initialData = {};
            if (selectedPageId === 'contact' && contactSettings) {
                if (typeToCreate === 'contact_hero' || typeToCreate === 'page_hero') initialData = contactSettings.hero || {};
                if (typeToCreate === 'contact_form') initialData = contactSettings.splitForm || {};
                if (typeToCreate === 'contact_info') initialData = contactSettings.faq || {};
            }

            const result = await dispatch(createComponentInstance({ 
                type: typeToCreate, 
                name: name.trim(),
                data: initialData 
            })).unwrap();

            const newInstanceId = result._id;
            const fullNewId = `${typeToCreate}_instance_${newInstanceId}`;

            // Update section order in redux
            if (selectedPageId === 'contact' && contactSettings?.sectionOrder) {
                const newOrder = contactSettings.sectionOrder.map(id => id === sectionId ? fullNewId : id);
                await dispatch(updateContactSettings({ ...contactSettings, sectionOrder: newOrder })).unwrap();
            }

            // Open the editor modal for the new instance
            setActiveInstanceId(newInstanceId);
            setActiveModal(typeToCreate as any);
            triggerRefresh();
            return result;
        } catch (e) {
            console.error('Failed to convert to instance:', e);
            throw e;
        }
    };

    const handleEditSection = async (sectionId: string) => {
        console.log('Editing section:', sectionId);
        
        // Modal ID mapping
        const modalMapping: Record<string, string> = {
            hero: 'hero',
            featured: 'featured_story',
            popular: 'popular',
            collections: 'collections',
            product_details: 'product_details',
            related_products: 'related_products',
            about_hero: 'about_hero',
            about_authenticity: 'about_authenticity',
            about_showcase: 'about_showcase',
            about_philosophy: 'about_philosophy',
            contact_hero: 'page_hero',
            page_hero: 'page_hero',
            contact_form: 'contact_form',
            contact_split_form: 'contact_form',
            contact_info: 'contact_info',
            contact_faq: 'contact_info',
            auth_login: 'auth_login',
            auth_register: 'auth_register',
            privacy_policy_edit: 'privacy_policy_edit',
            terms_of_service_edit: 'terms_of_service_edit',
            accessibility_edit: 'accessibility_edit',
            identity: 'identity',
            theme: 'theme',
            footer_contact: 'footer_contact',
            seo: 'seo',
            navbar: 'navbar',
            advantages: 'advantages',
            campaigns: 'campaigns',
            journal: 'journal',
            banner: 'banner',
            faq: 'faq_edit',
            explore_rooms: 'explore_rooms_edit',
            about_us: 'about_us_edit',
            custom_products: 'custom_products_edit',
            legal_content: 'legal_content',
            category_listing: 'category_listing',
            auth: selectedPageId === 'register' ? 'auth_register' : 'auth_login'
        };

        let finalSectionId = sectionId;
        let instanceId = null;

        if (sectionId.includes('_instance_')) {
            const parts = sectionId.split('_instance_');
            finalSectionId = parts[0];
            instanceId = parts[1];
        }

        const modalId = modalMapping[finalSectionId];

        // Convert default contact sections to instances on first edit
        const contactStaticSections = ['contact_hero', 'contact_form', 'contact_info', 'contact_split_form', 'contact_faq'];
        if (selectedPageId === 'contact' && contactStaticSections.includes(finalSectionId) && !instanceId) {
            if (!contactSettings) return;
            const defaultName = generateDefaultInstanceName(finalSectionId);
            await executeConversion(sectionId, defaultName);
            return;
        }

        if (modalId) {
            setActiveInstanceId(instanceId);
            setActiveModal(modalId);
        } else {
            console.warn('No modal mapped for sectionId:', sectionId);
        }
    };

    const handleAddFromStore = async (sectionId: string) => {
        if (!allowedPages.includes(selectedPageId)) return;

        const currentSections = sectionsState[selectedPageId] || [];
        const sectionExists = currentSections.some(s => s.id === sectionId);

        let newArray: PageSection[];

        if (sectionExists) {
            // Just activate existing
            newArray = currentSections.map(section =>
                section.id === sectionId ? { ...section, isActive: true } : section
            );
        } else {
            // Extract base component type if this is an instance ID
            const baseType = sectionId.includes('_instance_') ? sectionId.split('_instance_')[0] : sectionId;
            // Add as new from any initial section that has it, or a default
            const allInitial = Object.values(getInitialSections(t)).flat();
            const definition = allInitial.find(s => s.id === baseType);

            if (definition) {
                newArray = [...currentSections, { ...definition, id: sectionId, isActive: true }];
            } else {
                // Fallback for completely unknown but requested IDs
                newArray = [...currentSections, {
                    id: sectionId,
                    label: sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace('_', ' '),
                    description: 'New Component',
                    isActive: true,
                    hasSettings: true
                }];
            }
        }

        setSectionsState(prev => ({ ...prev, [selectedPageId]: newArray }));
        setIsComponentStoreOpen(false);
        await persistLayout(selectedPageId, newArray);
    };

    const handleDragEnd = async () => {
        const currentSections = sectionsState[selectedPageId] || [];
        await persistLayout(selectedPageId, currentSections);
    };

    const handleConvertSave = async () => {
        if (!sectionToConvert || !newInstanceName.trim()) return;
        
        try {
            await executeConversion(sectionToConvert, newInstanceName);
            setIsComponentNameModalOpen(false);
            setSectionToConvert(null);
            setNewInstanceName('');
        } catch (e) {
            console.error('Failed to convert to instance:', e);
        }
    };

    const triggerRefresh = () => {
        dispatch(fetchAdminHomeSettings());
        dispatch(fetchComponentInstances(undefined));
        dispatch(fetchAdminBanners());
        dispatch(fetchAdminPopularCollections());
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
            {/* 1. Dynamic Sidebar (Pages or Sections) */}
            <div className="w-72 bg-foreground/5 border-r border-foreground/10 flex-shrink-0 flex flex-col z-10 transition-all duration-300">
                {/* View: Page List */}
                {sidebarView === 'pages' && (
                    <div className="flex flex-col h-full animate-in slide-in-from-left-4 duration-300">
                        <div className="p-5 pb-2 pt-6">
                            <h2 className="font-bold text-base text-foreground tracking-tight mb-1">{t('admin.layoutEditor')}</h2>
                            <p className="text-xs text-foreground/50 font-medium">{t('admin.selectPage')}</p>
                        </div>
                        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                            {groupedPages.map(group => (
                                <div key={group.id} className="space-y-1.5 pt-1">
                                    <button
                                        onClick={() => toggleCategory(group.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group mb-0.5 border shadow-sm ${collapsedCategories.has(group.id) ? 'bg-foreground/5 border-foreground/5' : 'bg-background border-foreground/10 ring-1 ring-foreground/5'}`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-1 h-3.5 rounded-full transition-all ${collapsedCategories.has(group.id) ? 'bg-primary/20 group-hover:bg-primary/40' : 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${collapsedCategories.has(group.id) ? 'text-foreground/50 group-hover:text-foreground/80' : 'text-foreground'}`}>
                                                {group.label}
                                            </span>
                                        </div>
                                        <div className={`transition-all duration-300 ${collapsedCategories.has(group.id) ? 'rotate-0 opacity-40' : 'rotate-90 text-primary'}`}>
                                            <FiChevronRight size={14} />
                                        </div>
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                        {!collapsedCategories.has(group.id) && (
                                            <div className="space-y-1.5 pl-0.5 py-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {group.pages.map(page => (
                                                    <div
                                                        key={page.id}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => { setSelectedPageId(page.id); setSidebarView('sections'); }}
                                                        onKeyDown={(e) => { 
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                setSelectedPageId(page.id); 
                                                                setSidebarView('sections'); 
                                                            }
                                                        }}
                                                        className="w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all hover:bg-background hover:shadow-sm border border-transparent hover:border-foreground/10 group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                                    >
                                                        <div className="w-7 h-7 bg-background border border-foreground/20 rounded-lg flex items-center justify-center text-foreground/50 shadow-sm transition-all group-hover:text-foreground group-hover:border-foreground/30 shrink-0">
                                                            {page.icon ? <page.icon size={14} strokeWidth={1.5} /> : <FiLayout size={14} strokeWidth={1.5} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-[11px] text-foreground flex items-center justify-between transition-all">
                                                                <span className="truncate">{page.label}</span>
                                                                {page.id.startsWith('custom_') && (
                                                                    <button
                                                                        onClick={(e) => handleDeletePage(e, page.id)}
                                                                        className="p-1 text-foreground/20 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                                                        title={t('admin.deletePage') || 'Sayfayı Sil'}
                                                                    >
                                                                        <FiTrash2 size={10} />
                                                                    </button>
                                                                )}
                                                            </h3>
                                                        </div>
                                                        <FiChevronRight size={12} className="text-foreground/20 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </nav>
                        <div className="px-4 pb-4 mt-auto">
                            <button
                                onClick={() => setIsAddPageModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-foreground/30 text-foreground/50 hover:text-foreground hover:border-foreground/50 hover:bg-foreground/5 transition-all text-xs font-bold uppercase tracking-widest"
                            >
                                <FiPlus size={16} /> {t('admin.addPage') || 'Yeni Sayfa Ekle'}
                            </button>
                        </div>
                    </div>
                )}

                {/* View: Section Editor */}
                {sidebarView === 'sections' && (
                    <div className="flex flex-col h-full bg-foreground/5 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-5 pb-2 pt-6">
                            <button
                                onClick={() => setSidebarView('pages')}
                                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground/40 hover:text-foreground mb-4 transition-colors group"
                            >
                                <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" /> {t('admin.back')}
                            </button>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-foreground text-background rounded-md">
                                        {selectedPage?.icon && <selectedPage.icon size={14} />}
                                    </div>
                                    <h2 className="font-bold text-base text-foreground">{selectedPage?.label}</h2>
                                </div>
                                {allowedPages.includes(selectedPageId) && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(t('admin.confirmClearAll') || 'Bu sayfadaki tüm bileşenleri silmek istediğinizden emin misiniz?')) {
                                                    setSectionsState(prev => ({ ...prev, [selectedPageId]: [] }));
                                                    await persistLayout(selectedPageId, []);
                                                }
                                            }}
                                            className="w-7 h-7 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                                            title={t('admin.clearAll') || 'Tümünü Temizle'}
                                        >
                                            <FiTrash2 size={13} />
                                        </button>
                                        <div className="relative group flex items-center">
                                            <button
                                                onClick={() => setIsComponentStoreOpen(true)}
                                                className="w-7 h-7 flex items-center justify-center bg-foreground/10 hover:bg-foreground text-foreground/50 hover:text-background rounded-lg transition-all"
                                            >
                                                <FiPlus size={14} />
                                            </button>
                                            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-sm">
                                                {t('admin.store')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-foreground/50 font-medium">{t('admin.manageSections')}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-4 custom-scrollbar">
                            {activeSections.filter(s => s.isActive).length > 0 ? (
                                <div className="space-y-2">
                                {activeSections.filter(s => s.isActive).map((section, index) => {
                                    const Icon = SECTION_ICONS[section.id] || FiSidebar;

                                    return (
                                        <div
                                            key={section.id}
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('text/plain', index.toString());
                                                e.currentTarget.classList.add('opacity-50');
                                            }}
                                            onDragEnd={(e) => {
                                                e.currentTarget.classList.remove('opacity-50');
                                                handleDragEnd(); // Save to Redux after drop
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                                const targetIdx = index;
                                
                                                // HandleDragEnd will sync the updated array to Redux/Backend afterwards.
                                                if (allowedPages.includes(selectedPageId) && draggedIdx !== targetIdx) {
                                                    const currentActive = activeSections.filter(s => s.isActive);
                                                    const draggedItem = currentActive[draggedIdx];
                                                    const newArr = [...currentActive];
                                                    newArr.splice(draggedIdx, 1);
                                                    newArr.splice(targetIdx, 0, draggedItem);
                                
                                                    const inactiveItems = activeSections.filter(s => !s.isActive);
                                                    const fullArray = [...newArr, ...inactiveItems];
                                
                                                    setSectionsState(prev => ({ ...prev, [selectedPageId]: fullArray }));
                                                }
                                            }}
                                            onClick={() => { if (section.hasSettings && section.isActive) handleEditSection(section.id); }}
                                            className={`relative flex items-center justify-between p-3 rounded-xl border bg-background shadow-sm transition-all group cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${section.isActive ? 'border-foreground/20' : 'border-foreground/20 opacity-60'}`}
                                        >
                                            <div className="flex flex-1 items-center gap-3 overflow-hidden pr-2">
                                                {allowedPages.includes(selectedPageId) && (
                                                    <div className="text-foreground/30 group-hover:text-foreground/50 shrink-0">
                                                        <FiMenu size={14} />
                                                    </div>
                                                )}
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${section.isActive ? 'bg-foreground/10 text-foreground' : 'bg-foreground/5 text-foreground/40'}`}>
                                                    <Icon size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className={`font-bold text-xs truncate ${section.isActive ? 'text-foreground' : 'text-foreground/50'}`}>{section.label}</h3>
                                                    <p className="text-[10px] text-foreground/40 truncate">{section.description}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0 ml-2 relative z-20">
                                                {section.hasSettings && section.isActive && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEditSection(section.id); }}
                                                        className="p-1.5 text-foreground/40 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                        title={t('admin.configure')}
                                                    >
                                                        <FiEdit2 size={13} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveSection(section.id); }}
                                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer text-foreground/40 hover:text-red-500 hover:bg-red-500/10`}
                                                    title={t('admin.delete')}
                                                >
                                                    <FiX size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-foreground/40 text-xs border-2 border-dashed border-foreground/20 rounded-xl bg-foreground/5 mt-4">
                                <p>{t('admin.noComponents')}</p>
                                <p className="text-[10px] mt-1 opacity-70">{t('admin.addComponentDesc')}</p>
                            </div>
                        )}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Right: Live Preview */}
            <div className="flex-1 bg-foreground/5 flex flex-col items-center justify-center p-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

                {/* View Mode Toggle - Floating at Top */}
                <div className="absolute top-1 flex items-center gap-2 bg-background/90 backdrop-blur shadow-sm border border-foreground/20 p-1.5 rounded-lg z-20">
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'desktop' ? 'bg-foreground text-background shadow-md' : 'text-foreground/50 hover:bg-foreground/10'
                            }`}
                    >
                        <FiMonitor size={14} />
                        {t('admin.desktop')}
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'mobile' ? 'bg-foreground text-background shadow-md' : 'text-foreground/50 hover:bg-foreground/10'
                            }`}
                    >
                        <FiSmartphone size={14} />
                        {t('admin.mobile')}
                    </button>
                </div>

                {/* Browser-like window wrapper */}
                <div className={`bg-background shadow-2xl transition-all duration-500 border border-foreground/20 flex flex-col overflow-hidden relative ${viewMode === 'desktop' ? 'w-[98%] h-[95%] rounded-2xl' : 'w-[375px] h-[780px] rounded-[3rem] border-[8px] border-foreground'
                    }`}>

                    {/* Desktop Address Bar (Fake) */}
                    {viewMode === 'desktop' && (
                        <div className="bg-foreground/5 border-b border-foreground/10 px-4 py-2 flex items-center gap-4 select-none">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                            </div>
                            <div className="flex-1 bg-background border border-foreground/20 rounded-md py-1 px-3 text-[10px] text-foreground/40 flex items-center gap-2 shadow-sm">
                                <FiGlobe size={10} />
                                {`${typeof window !== 'undefined' ? window.location.origin.replace(/^https?:\/\//, '') : 'your-store.com'}${selectedPage?.path}`}
                            </div>
                        </div>
                    )}

                    {/* Mobile Status Bar (Fake) */}
                    {viewMode === 'mobile' && (
                        <div className="h-10 w-full flex items-center justify-between px-8 pt-2">
                            <span className="text-[10px] font-bold">9:41</span>
                            <div className="flex gap-1 items-center">
                                <div className="w-3 h-3 bg-foreground/30 rounded-sm"></div>
                                <div className="w-4 h-2 bg-foreground/30 rounded-sm"></div>
                            </div>
                        </div>
                    )}

                    {/* IFrame or Preview Content */}
                    <div className="flex-1 relative overflow-hidden bg-background">
                        {viewMode === 'desktop' ? (
                            <div
                                style={{
                                    width: '1280px',
                                    height: '133.33%', // 100 / 0.75
                                    transform: 'scale(0.75)',
                                    transformOrigin: 'top left'
                                }}
                                className="absolute top-0 left-0"
                            >
                                <iframe
                                    key={refreshKey}
                                    src={`${typeof window !== 'undefined' ? window.location.origin : ''}${selectedPage?.path}?preview=true`}
                                    className="w-full h-full border-none overflow-x-hidden"
                                    title="live-preview"
                                />
                            </div>
                        ) : (
                            <iframe
                                key={refreshKey}
                                src={`${typeof window !== 'undefined' ? window.location.origin : ''}${selectedPage?.path}?preview=true`}
                                className="w-full h-full border-none"
                                title="live-preview"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Create Custom Page Modal */}
            <AnimatePresence>
                {isAddPageModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center">
                        <div className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-md border border-foreground/10 animate-in zoom-in-95 duration-200">
                            <h3 className="text-lg font-bold text-foreground mb-1">{t('admin.addPage') || 'Yeni Sayfa Ekle'}</h3>
                            <p className="text-xs text-foreground/50 mb-6">{t('admin.addPageDesc') || 'Özel bir sayfa adı belirleyin. Sayfa bağlantısı isme göre otomatik oluşturulacaktır.'}</p>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">
                                        {t('admin.pageName') || 'Sayfa Adı'}
                                    </label>
                                    <input
                                        type="text"
                                        value={newPageName}
                                        onChange={(e) => setNewPageName(e.target.value)}
                                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Örn: Kampanyalar"
                                        autoFocus
                                    />
                                    {newPageName && (
                                        <p className="text-[10px] text-foreground/40 ml-1">
                                            Oluşturulacak URL: <span className="text-primary font-mono cursor-default">/{newPageName.toLowerCase().replace(/[^a-z0-9ğüşöçı]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}</span>
                                        </p>
                                    )}
                                </div>
                                
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={() => { setIsAddPageModalOpen(false); setNewPageName(''); }}
                                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-foreground/60 hover:text-foreground transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!newPageName.trim()) return;
                                            const slug = newPageName.toLowerCase().replace(/[^a-z0-9ğüşöçı]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                                            const newPath = `/${slug}`;
                                            
                                            try {
                                                const resultAction = await dispatch(createPage({
                                                    title: newPageName,
                                                    // Validation check
                                                    slug: (SYSTEM_SLUGS.includes(slug) ? (alert('Slug is reserved') as any) : slug),
                                                    path: newPath,
                                                    description: 'Özel Kullanıcı Sayfası',
                                                    sections: []
                                                })).unwrap();
                                                
                                                const newId = resultAction._id;
                                                setSectionsState(prev => ({ ...prev, [newId]: [] }));
                                                
                                                setNewPageName('');
                                                setIsAddPageModalOpen(false);
                                                
                                                setSelectedPageId(newId);
                                                setSidebarView('sections');
                                                triggerRefresh();
                                            } catch (error) {
                                                console.error('Failed to create page:', error);
                                                alert('Sayfa oluşturulurken bir hata oluştu. (Slug benzersiz olmalı)');
                                            }
                                        }}
                                        className="bg-[var(--primary-color)] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all"
                                    >
                                        Sayfayı Oluştur
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Component Naming Modal (for conversion) */}
            <AnimatePresence>
                {isComponentNameModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
                        <div className="bg-background rounded-3xl shadow-2xl p-8 w-full max-w-md border border-foreground/5 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                    <FiTag size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Bileşeni İsimlendir</h3>
                                    <p className="text-xs text-foreground/40 mt-1">Bu bileşeni özelleştirmek için bir isim belirleyin.</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">
                                        Bileşen Adı
                                    </label>
                                    <input
                                        type="text"
                                        value={newInstanceName}
                                        onChange={(e) => setNewInstanceName(e.target.value)}
                                        className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all font-medium"
                                        placeholder="Örn: Ana Sayfa Hero"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleConvertSave()}
                                    />
                                </div>
                                
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => { setIsComponentNameModalOpen(false); setSectionToConvert(null); setNewInstanceName(''); }}
                                        className="px-6 py-3 rounded-2xl text-[10px] font-bold tracking-widest uppercase text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={handleConvertSave}
                                        disabled={!newInstanceName.trim()}
                                        className="bg-foreground text-background px-8 py-3 rounded-2xl text-[10px] font-bold tracking-widest uppercase hover:bg-primary hover:text-white transition-all shadow-xl disabled:opacity-50 disabled:hover:bg-foreground"
                                    >
                                        Kaydet ve Düzenle
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modals Container */}
            <AnimatePresence>
                {activeModal === 'hero' && (
                    <BannerEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'page_hero' && (
                    <HeroEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'contact_hero' && (
                    <HeroEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'featured_story' && (
                    <FeaturedSectionEditorModal
                        onClose={() => setActiveModal(null)}
                        onSave={() => { triggerRefresh(); setActiveModal(null); }}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'collections' && (
                    <CategoryLayoutEditorModal
                        onClose={() => setActiveModal(null)}
                        onSave={() => { triggerRefresh(); setActiveModal(null); }}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'category_listing' && (
                    <CategoryListingEditorModal
                        onClose={() => setActiveModal(null)}
                        onSave={() => { triggerRefresh(); setActiveModal(null); }}
                        instanceId={activeInstanceId as string}
                    />
                )}
                {activeModal === 'popular' && (
                    <CollectionsEditorModal
                        onClose={() => setActiveModal(null)}
                        onSave={() => { triggerRefresh(); setActiveModal(null); }}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'journal' && (
                    <JournalEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'advantages' && (
                    <AdvantageSectionEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'banner' && (
                    <PromoBannerSettingsModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'campaigns' && (
                    <CampaignEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {['identity', 'theme', 'footer_contact', 'seo', 'navbar'].includes(activeModal || '') && (
                    <GlobalSettingsEditorModal
                        sectionId={activeModal!}
                        onClose={() => setActiveModal(null)}
                        onSave={() => { triggerRefresh(); setActiveModal(null); }}
                    />
                )}
                {['product_details', 'related_products'].includes(activeModal || '') && (
                    <ProductSettingsEditorModal
                        sectionId={activeModal!}
                        onClose={() => setActiveModal(null)}
                        onSave={() => { triggerRefresh(); setActiveModal(null); }}
                    />
                )}
                {activeModal === 'about_hero' && (
                    <AboutHeroEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'about_authenticity' && (
                    <AboutAuthenticityEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'about_showcase' && (
                    <AboutShowcaseEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'about_philosophy' && (
                    <AboutPhilosophyEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'contact_form' && (
                    <ContactFormEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'contact_info' && (
                    <ContactInfoEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'auth_login' && (
                    <AuthLayoutEditorModal
                        type="login"
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'auth_register' && (
                    <AuthLayoutEditorModal
                        type="register"
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {isComponentStoreOpen && (
                    <ComponentStoreModal
                        onClose={() => setIsComponentStoreOpen(false)}
                        onAdd={handleAddFromStore}
                        activeIds={activeSections.filter(s => s.isActive).map(s => s.id)}
                        pageType={selectedPageId}
                    />
                )}
                {activeModal === 'privacy_policy_edit' && (
                    <LegalSettingsEditorModal
                        type="privacy_policy"
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'terms_of_service_edit' && (
                    <LegalSettingsEditorModal
                        type="terms_of_service"
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'accessibility_edit' && (
                    <LegalSettingsEditorModal
                        type="accessibility"
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'faq_edit' && (
                    <FAQEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'explore_rooms_edit' && (
                    <ExploreRoomsEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'about_us_edit' && (
                    <AboutUsEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'custom_products_edit' && (
                    <CustomProductsEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
                {activeModal === 'legal_content' && (
                    <LegalContentEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                        instanceId={activeInstanceId || undefined}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
