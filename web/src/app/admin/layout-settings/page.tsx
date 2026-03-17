'use client';

import { useState, useEffect } from 'react';
import {
    FiEdit2, FiPlus, FiX, FiColumns, FiGrid, FiSidebar,
    FiLayout, FiImage, FiSettings,
    FiMenu, FiGlobe, FiEye, FiEyeOff, FiMonitor, FiSmartphone,
    FiChevronLeft, FiChevronRight, FiSearch, FiPhone, FiStar, FiBook, FiMail, FiFilter, FiShoppingBag, FiLayers,
    FiHome, FiTag, FiMapPin, FiUser, FiList, FiDroplet, FiAward, FiLock, FiShield, FiActivity
} from 'react-icons/fi';
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
    fetchAdminAuthSettings
} from '@/lib/slices/contentSlice';
import { AnimatePresence } from 'framer-motion';
// --- Components ---
import GlobalSettingsEditorModal from './_components/Global/GlobalSettingsEditorModal';
import BannerEditorModal from './_components/Home/BannerEditorModal';
import CollectionsEditorModal from './_components/Home/CollectionsEditorModal';
import FeaturedSectionEditorModal from './_components/Home/FeaturedSectionEditorModal';
import CategoryLayoutEditorModal from './_components/Home/CategoryLayoutEditorModal';
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
import ContactHeroEditorModal from './_components/Contact/ContactHeroEditorModal';
import ContactSplitFormEditorModal from './_components/Contact/ContactSplitFormEditorModal';
import ContactFaqEditorModal from './_components/Contact/ContactFaqEditorModal';
import AuthLayoutEditorModal from './_components/Auth/AuthLayoutEditorModal';
import LegalSettingsEditorModal from './_components/Global/LegalSettingsEditorModal';

// --- Types ---

interface PageSection {
    id: string;
    label: string;
    description: string;
    isActive: boolean;
    hasSettings: boolean; // Does it have a detail editor like Banners?
}

// --- Mock Data ---
const PAGES = [
    { id: 'global', label: 'Global Settings', path: '/', icon: FiSettings, desc: 'Site identity, SEO, & footer' },
    { id: 'home', label: 'Home Page', path: '/', icon: FiHome, desc: 'Hero slider & featured sections' },
    { id: 'shop', label: 'Shop Archive', path: '/cart', icon: FiShoppingBag, desc: 'Product grid & filters' },
    { id: 'product', label: 'Product Detail', path: '/products/demo', icon: FiTag, desc: 'Individual product layout' },
    { id: 'about', label: 'Our Story', path: '/about', icon: FiUser, desc: 'About us page content' },
    { id: 'contact', label: 'Contact', path: '/contact', icon: FiMapPin, desc: 'Contact form & map' },
    { id: 'login', label: 'Login', path: '/login', icon: FiLayout, desc: 'Login page layout' },
    { id: 'register', label: 'Register', path: '/register', icon: FiLayout, desc: 'Register page layout' },
    { id: 'privacy', label: 'Privacy Policy', path: '/privacy-policy', icon: FiLock, desc: 'Privacy policy content' },
    { id: 'terms', label: 'Terms of Service', path: '/terms-of-service', icon: FiShield, desc: 'Terms of service content' },
    { id: 'accessibility', label: 'Accessibility', path: '/accessibility', icon: FiActivity, desc: 'Accessibility statement' },
];

const INITIAL_SECTIONS: Record<string, PageSection[]> = {
    global: [
        { id: 'identity', label: 'Site Identity', description: 'Logo, Site Title, Favicon', isActive: true, hasSettings: true },
        { id: 'theme', label: 'Theme & Styling', description: 'Brand Colors and Typography', isActive: true, hasSettings: true },
        { id: 'navbar', label: 'Navigation Menu', description: 'Main menu links', isActive: true, hasSettings: true },
        { id: 'footer_contact', label: 'Footer & Contact', description: 'Copyright, Email, Phone', isActive: true, hasSettings: true },
        { id: 'seo', label: 'SEO Defaults', description: 'Default Meta Tags', isActive: true, hasSettings: true },
    ],
    home: [
        { id: 'hero', label: 'Hero Slider', description: 'Main banner slider at the top', isActive: true, hasSettings: true },
        { id: 'featured', label: 'Split Screen Layout', description: 'Video/Text Split Section', isActive: true, hasSettings: true },
        { id: 'collections', label: 'Card / Masonry Grid', description: 'Grid of top categories', isActive: true, hasSettings: true },
        { id: 'advantages', label: 'Advantage Area', description: 'Campaign & Brand Benefits', isActive: true, hasSettings: true },
        { id: 'campaigns', label: 'Campaign Cards', description: 'Promo cards for products/categories', isActive: false, hasSettings: true },
        { id: 'banner', label: 'Featured Image Banner', description: 'Wide promotional banner', isActive: true, hasSettings: true },
        { id: 'popular', label: 'Two Column Promos', description: 'New Arrivals & Best Sellers cards', isActive: true, hasSettings: true },
        { id: 'journal', label: 'Journal / News', description: 'Latest blog posts and news', isActive: false, hasSettings: true },
    ],
    shop: [
        { id: 'filters', label: 'Sidebar Filters', description: 'Category and price filters', isActive: true, hasSettings: false },
        { id: 'grid', label: 'Product Grid', description: 'Main product list', isActive: true, hasSettings: false },
    ],
    product: [
        { id: 'product_details', label: 'Product Base Info', description: 'Main images gallery, description and purchase area', isActive: true, hasSettings: true },
        { id: 'related_products', label: 'Related Products', description: 'Display curated collection of products below the main info', isActive: true, hasSettings: true },
        { id: 'advantages', label: 'Advantage Area', description: 'Campaign & Brand Benefits', isActive: false, hasSettings: true },
        { id: 'journal', label: 'Journal / News', description: 'Latest blog posts and news', isActive: false, hasSettings: true },
        { id: 'banner', label: 'Featured Image Banner', description: 'Wide promotional banner', isActive: false, hasSettings: true },
    ],
    about: [
        { id: 'about_hero', label: 'About Top Banner', description: 'Main hero text and background video', isActive: true, hasSettings: true },
        { id: 'about_authenticity', label: 'Craftsmanship Section', description: 'Text and image layout', isActive: true, hasSettings: true },
        { id: 'about_showcase', label: 'Video Showcase', description: 'Two column video/image showcase', isActive: true, hasSettings: true },
        { id: 'about_philosophy', label: 'Philosophy Quote', description: 'Bottom quote and branding', isActive: true, hasSettings: true },
    ],
    contact: [
        { id: 'contact_hero', label: 'Contact Hero', description: 'Top banner section', isActive: true, hasSettings: true },
        { id: 'contact_split_form', label: 'Split Form', description: 'Form and detail split', isActive: true, hasSettings: true },
        { id: 'contact_faq', label: 'FAQ Block', description: 'Questions and Support', isActive: true, hasSettings: true },
    ],
    login: [
        { id: 'auth_login', label: 'Login Form Layout', description: 'Configure image and form placement', isActive: true, hasSettings: true },
    ],
    register: [
        { id: 'auth_register', label: 'Register Form Layout', description: 'Configure image and form placement', isActive: true, hasSettings: true },
    ],
    privacy: [
        { id: 'privacy_policy_edit', label: 'Privacy Policy Content', description: 'Edit the main text and metadata', isActive: true, hasSettings: true },
    ],
    terms: [
        { id: 'terms_of_service_edit', label: 'Terms of Service Content', description: 'Edit the main text and metadata', isActive: true, hasSettings: true },
    ],
    accessibility: [
        { id: 'accessibility_edit', label: 'Accessibility Content', description: 'Edit the main text and metadata', isActive: true, hasSettings: true },
    ]
};

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
    auth_login: FiLayout,
    auth_register: FiLayout,
    privacy_policy_edit: FiLock,
    terms_of_service_edit: FiShield,
    accessibility_edit: FiActivity
};

// --- Main Component ---

export default function LayoutSettingsPage() {
    const dispatch = useAppDispatch();
    const [selectedPageId, setSelectedPageId] = useState('home');
    const [sectionsState, setSectionsState] = useState(INITIAL_SECTIONS);
    const [sidebarView, setSidebarView] = useState<'pages' | 'sections'>('pages');
    const [refreshKey, setRefreshKey] = useState(0);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [isComponentStoreOpen, setIsComponentStoreOpen] = useState(false);

    // Modal States
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const { homeSettings, productSettings, aboutSettings, contactSettings, authSettings } = useAppSelector((state) => state.content);

    // Fetch Global Settings on mount
    useEffect(() => {
        dispatch(fetchGlobalSettings());
        dispatch(fetchAdminHomeSettings());
        dispatch(fetchAdminPopularCollections());
        dispatch(fetchAdminProductSettings());
        dispatch(fetchAdminAboutSettings());
        dispatch(fetchAdminContactSettings());
        dispatch(fetchAdminAuthSettings());
    }, [dispatch]);

    // Set initial order exactly once on mount or when homeSettings first loads
    useEffect(() => {
        if (homeSettings?.sectionOrder && sectionsState.home.length > 0) {
            // Check if we already synced it avoiding continuous layout-thrashing
            const isUnsynced = sectionsState.home.some((sec, idx) => {
                const reduxOrder = homeSettings.sectionOrder;
                if (!reduxOrder) return false;
                const expectedId = reduxOrder[idx];
                const hidden = homeSettings.hiddenSections || [];
                return sec.id !== expectedId || sec.isActive === hidden.includes(sec.id);
            });

            if (isUnsynced) {
                const currentOrder = homeSettings.sectionOrder;
                const hiddenSections = homeSettings.hiddenSections || [];

                const sortedHome = [...INITIAL_SECTIONS.home].map(sec => ({
                    ...sec,
                    isActive: !hiddenSections.includes(sec.id)
                })).sort((a, b) => {
                    const aIdx = currentOrder.indexOf(a.id);
                    const bIdx = currentOrder.indexOf(b.id);
                    if (aIdx === -1) return 1;
                    if (bIdx === -1) return -1;
                    return aIdx - bIdx;
                });

                setSectionsState(prev => ({ ...prev, home: sortedHome }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [homeSettings?.sectionOrder, homeSettings?.hiddenSections]);

    useEffect(() => {
        if (productSettings?.sectionOrder && sectionsState.product.length > 0) {
            const isUnsynced = sectionsState.product.some((sec, idx) => {
                const reduxOrder = productSettings.sectionOrder;
                if (!reduxOrder) return false;
                const expectedId = reduxOrder[idx];
                const hidden = productSettings.hiddenSections || [];
                return sec.id !== expectedId || sec.isActive === hidden.includes(sec.id);
            });

            if (isUnsynced) {
                const currentOrder = productSettings.sectionOrder;
                const hiddenSections = productSettings.hiddenSections || [];

                const sortedProduct = [...INITIAL_SECTIONS.product].map(sec => ({
                    ...sec,
                    isActive: !hiddenSections.includes(sec.id)
                })).sort((a, b) => {
                    const aIdx = currentOrder.indexOf(a.id);
                    const bIdx = currentOrder.indexOf(b.id);
                    if (aIdx === -1) return 1;
                    if (bIdx === -1) return -1;
                    return aIdx - bIdx;
                });

                setSectionsState(prev => ({ ...prev, product: sortedProduct }));
            }
        }
    }, [productSettings?.sectionOrder, productSettings?.hiddenSections]);

    useEffect(() => {
        if (aboutSettings?.sectionOrder && sectionsState.about && sectionsState.about.length > 0) {
            const isUnsynced = sectionsState.about.some((sec, idx) => {
                const reduxOrder = aboutSettings.sectionOrder;
                if (!reduxOrder) return false;
                const expectedId = reduxOrder[idx];
                const hidden = aboutSettings.hiddenSections || [];
                return sec.id !== expectedId || sec.isActive === hidden.includes(sec.id);
            });

            if (isUnsynced) {
                const currentOrder = aboutSettings.sectionOrder;
                const hiddenSections = aboutSettings.hiddenSections || [];

                const sortedAbout = [...INITIAL_SECTIONS.about].map(sec => ({
                    ...sec,
                    isActive: !hiddenSections.includes(sec.id)
                })).sort((a, b) => {
                    const aIdx = currentOrder.indexOf(a.id);
                    const bIdx = currentOrder.indexOf(b.id);
                    if (aIdx === -1) return 1;
                    if (bIdx === -1) return -1;
                    return aIdx - bIdx;
                });

                setSectionsState(prev => ({ ...prev, about: sortedAbout }));
            }
        }
    }, [aboutSettings?.sectionOrder, aboutSettings?.hiddenSections]);

    useEffect(() => {
        if (contactSettings?.sectionOrder && sectionsState.contact && sectionsState.contact.length > 0) {
            const isUnsynced = sectionsState.contact.some((sec, idx) => {
                const reduxOrder = contactSettings.sectionOrder;
                if (!reduxOrder) return false;
                const expectedId = reduxOrder[idx];
                const hidden = contactSettings.hiddenSections || [];
                return sec.id !== expectedId || sec.isActive === hidden.includes(sec.id);
            });

            if (isUnsynced) {
                const currentOrder = contactSettings.sectionOrder;
                const hiddenSections = contactSettings.hiddenSections || [];

                const sortedContact = [...INITIAL_SECTIONS.contact].map(sec => ({
                    ...sec,
                    isActive: !hiddenSections.includes(sec.id)
                })).sort((a, b) => {
                    const aIdx = currentOrder.indexOf(a.id);
                    const bIdx = currentOrder.indexOf(b.id);
                    if (aIdx === -1) return 1;
                    if (bIdx === -1) return -1;
                    return aIdx - bIdx;
                });

                setSectionsState(prev => ({ ...prev, contact: sortedContact }));
            }
        }
    }, [contactSettings?.sectionOrder, contactSettings?.hiddenSections]);

    const activeSections = sectionsState[selectedPageId] || [];
    const allowedPages = ['home', 'product', 'about', 'contact', 'login', 'register', 'privacy', 'terms', 'accessibility'];
    const selectedPage = PAGES.find(p => p.id === selectedPageId);

    const toggleSection = async (sectionId: string) => {
        const newArray = sectionsState[selectedPageId].map(section =>
            section.id === sectionId ? { ...section, isActive: !section.isActive } : section
        );

        setSectionsState(prev => ({ ...prev, [selectedPageId]: newArray }));

        if (selectedPageId === 'home' && homeSettings) {
            const hiddenIds = newArray.filter(s => !s.isActive).map(s => s.id);
            try {
                await dispatch(updateHomeSettings({ ...homeSettings, hiddenSections: hiddenIds })).unwrap();
                triggerRefresh();
            } catch (e) {
                console.error('Failed to sync hide/show', e);
            }
        } else if (selectedPageId === 'product' && productSettings) {
            const hiddenIds = newArray.filter(s => !s.isActive).map(s => s.id);
            try {
                await dispatch(updateProductSettings({ ...productSettings, hiddenSections: hiddenIds })).unwrap();
                triggerRefresh();
            } catch (e) {
                console.error('Failed to sync hide/show', e);
            }
        } else if (selectedPageId === 'about' && aboutSettings) {
            const hiddenIds = newArray.filter(s => !s.isActive).map(s => s.id);
            try {
                await dispatch(updateAboutSettings({ ...aboutSettings, hiddenSections: hiddenIds })).unwrap();
                triggerRefresh();
            } catch (e) {
                console.error('Failed to sync hide/show', e);
            }
        } else if (selectedPageId === 'contact' && contactSettings) {
            const hiddenIds = newArray.filter(s => !s.isActive).map(s => s.id);
            try {
                await dispatch(updateContactSettings({ ...contactSettings, hiddenSections: hiddenIds })).unwrap();
                triggerRefresh();
            } catch (e) {
                console.error('Failed to sync hide/show', e);
            }
        } else if ((selectedPageId === 'login' || selectedPageId === 'register') && authSettings) {
            // No hide/show for auth yet but good for symmetry
            triggerRefresh();
        }
    };

    const handleEditSection = (sectionId: string) => {
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
            contact_hero: 'contact_hero',
            contact_split_form: 'contact_split_form',
            contact_faq: 'contact_faq',
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
            banner: 'banner'
        };

        const modalId = modalMapping[sectionId];
        if (modalId) {
            setActiveModal(modalId);
        } else {
            console.warn('No modal mapped for sectionId:', sectionId);
        }
    };

    const handleAddFromStore = async (sectionId: string) => {
        if (!allowedPages.includes(selectedPageId)) return;

        const currentSections = sectionsState[selectedPageId];
        const sectionExists = currentSections.some(s => s.id === sectionId);

        let newArray: PageSection[];

        if (sectionExists) {
            // Just activate existing
            newArray = currentSections.map(section =>
                section.id === sectionId ? { ...section, isActive: true } : section
            );
        } else {
            // Add as new from any initial section that has it, or a default
            const allInitial = Object.values(INITIAL_SECTIONS).flat();
            const definition = allInitial.find(s => s.id === sectionId);

            if (definition) {
                newArray = [...currentSections, { ...definition, isActive: true }];
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

        if (selectedPageId === 'home' && homeSettings) {
            const currentOrder = homeSettings?.sectionOrder || [];
            const newOrder = currentOrder.includes(sectionId) ? currentOrder : [...currentOrder, sectionId];
            const hiddenIds = newArray.filter(s => !s.isActive).map(s => s.id);
            try {
                await dispatch(updateHomeSettings({ ...homeSettings, hiddenSections: hiddenIds, sectionOrder: newOrder })).unwrap();
                triggerRefresh();
            } catch (e) {
                console.error('Failed to add component', e);
            }
        } else if (selectedPageId === 'product' && productSettings) {
            const currentOrder = productSettings?.sectionOrder || [];
            const newOrder = currentOrder.includes(sectionId) ? currentOrder : [...currentOrder, sectionId];
            const hiddenIds = newArray.filter(s => !s.isActive).map(s => s.id);
            try {
                await dispatch(updateProductSettings({ ...productSettings, hiddenSections: hiddenIds, sectionOrder: newOrder })).unwrap();
                triggerRefresh();
            } catch (e) {
                console.error('Failed to add component', e);
            }
        } else if (selectedPageId === 'about' && aboutSettings) {
            const currentOrder = aboutSettings?.sectionOrder || [];
            const newOrder = currentOrder.includes(sectionId) ? currentOrder : [...currentOrder, sectionId];
            const hiddenIds = newArray.filter(s => !s.isActive).map(s => s.id);
            try {
                await dispatch(updateAboutSettings({ ...aboutSettings, hiddenSections: hiddenIds, sectionOrder: newOrder })).unwrap();
                triggerRefresh();
            } catch (e) {
                console.error('Failed to add component', e);
            }
        } else if (selectedPageId === 'contact' && contactSettings) {
            const currentOrder = contactSettings?.sectionOrder || [];
            const newOrder = currentOrder.includes(sectionId) ? currentOrder : [...currentOrder, sectionId];
            const hiddenIds = newArray.filter(s => !s.isActive).map(s => s.id);
            try {
                await dispatch(updateContactSettings({ ...contactSettings, hiddenSections: hiddenIds, sectionOrder: newOrder })).unwrap();
                triggerRefresh();
            } catch (e) {
                console.error('Failed to add component', e);
            }
        }
    };



    const handleDragEnd = async () => {
        if (selectedPageId === 'home' && homeSettings) {
            setTimeout(() => {
                setSectionsState(currentPrev => {
                    const orderIds = currentPrev.home.map(s => s.id);
                    if (JSON.stringify(orderIds) !== JSON.stringify(homeSettings.sectionOrder)) {
                        dispatch(updateHomeSettings({ ...homeSettings, sectionOrder: orderIds }))
                            .unwrap()
                            .then(() => triggerRefresh())
                            .catch(e => console.error('Failed to sync order', e));
                    }
                    return currentPrev;
                });
            }, 350);
        } else if (selectedPageId === 'product' && productSettings) {
            setTimeout(() => {
                setSectionsState(currentPrev => {
                    const orderIds = currentPrev.product.map(s => s.id);
                    if (JSON.stringify(orderIds) !== JSON.stringify(productSettings.sectionOrder)) {
                        dispatch(updateProductSettings({ ...productSettings, sectionOrder: orderIds }))
                            .unwrap()
                            .then(() => triggerRefresh())
                            .catch(e => console.error('Failed to save order', e));
                    }
                    return currentPrev;
                });
            }, 0);
        } else if (selectedPageId === 'about' && aboutSettings) {
            setTimeout(() => {
                setSectionsState(currentPrev => {
                    const orderIds = currentPrev.about.map(s => s.id);
                    if (JSON.stringify(orderIds) !== JSON.stringify(aboutSettings.sectionOrder)) {
                        dispatch(updateAboutSettings({ ...aboutSettings, sectionOrder: orderIds }))
                            .unwrap()
                            .then(() => triggerRefresh())
                            .catch(e => console.error('Failed to save order', e));
                    }
                    return currentPrev;
                });
            }, 0);
        } else if (selectedPageId === 'contact' && contactSettings) {
            setTimeout(() => {
                setSectionsState(currentPrev => {
                    const orderIds = currentPrev.contact.map(s => s.id);
                    if (JSON.stringify(orderIds) !== JSON.stringify(contactSettings.sectionOrder)) {
                        dispatch(updateContactSettings({ ...contactSettings, sectionOrder: orderIds }))
                            .unwrap()
                            .then(() => triggerRefresh())
                            .catch(e => console.error('Failed to save order', e));
                    }
                    return currentPrev;
                });
            }, 0);
        }
    };

    const triggerRefresh = () => {
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
                            <h2 className="font-bold text-base text-foreground tracking-tight mb-1">Layout Editor</h2>
                            <p className="text-xs text-foreground/50 font-medium">Select a page to customize</p>
                        </div>
                        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                            {PAGES.map(page => (
                                <button
                                    key={page.id}
                                    onClick={() => { setSelectedPageId(page.id); setSidebarView('sections'); }}
                                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-background hover:shadow-sm border border-transparent hover:border-foreground/10 group"
                                >
                                    <div className="w-8 h-8 bg-background border border-foreground/20 rounded-lg flex items-center justify-center text-foreground/50 shadow-sm transition-all group-hover:text-foreground group-hover:border-foreground/30 shrink-0">
                                        <page.icon size={16} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-xs text-foreground mb-0.5 flex items-center justify-between">
                                            {page.label}
                                        </h3>
                                        <p className="text-[10px] text-foreground/50 font-medium opacity-80 truncate">{page.desc}</p>
                                    </div>
                                    <FiChevronRight size={14} className="text-foreground/30 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                                </button>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-foreground/10">
                            <button className="w-full py-3 border border-dashed border-foreground/30 rounded-xl text-foreground/40 text-[10px] font-bold hover:border-foreground hover:text-foreground transition-colors uppercase tracking-wider bg-background">
                                + Custom Page
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
                                <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Back
                            </button>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-foreground text-background rounded-md">
                                        {selectedPage?.icon && <selectedPage.icon size={14} />}
                                    </div>
                                    <h2 className="font-bold text-base text-foreground">{selectedPage?.label}</h2>
                                </div>
                                {allowedPages.includes(selectedPageId) && (
                                    <div className="relative group flex items-center">
                                        <button
                                            onClick={() => setIsComponentStoreOpen(true)}
                                            className="w-7 h-7 flex items-center justify-center bg-foreground/10 hover:bg-foreground text-foreground/50 hover:text-background rounded-lg transition-all"
                                        >
                                            <FiPlus size={14} />
                                        </button>
                                        <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-sm">
                                            Store
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-foreground/50 font-medium">Manage page sections</p>
                        </div>

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
                                                        title="Configure"
                                                    >
                                                        <FiEdit2 size={13} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}
                                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer text-foreground/40 hover:text-red-500 hover:bg-red-500/10`}
                                                    title={"Delete / Put back to store"}
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
                                <p>No components added.</p>
                                <p className="text-[10px] mt-1 opacity-70">Add components from the store.</p>
                            </div>
                        )}


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
                        Desktop
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'mobile' ? 'bg-foreground text-background shadow-md' : 'text-foreground/50 hover:bg-foreground/10'
                            }`}
                    >
                        <FiSmartphone size={14} />
                        Mobile
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

            {/* Modals Container */}
            <AnimatePresence>
                {activeModal === 'hero' && (
                    <BannerEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'featured_story' && (
                    <FeaturedSectionEditorModal
                        onClose={() => setActiveModal(null)}
                        onSave={() => { triggerRefresh(); setActiveModal(null); }}
                    />
                )}
                {activeModal === 'collections' && (
                    <CollectionsEditorModal
                        onClose={() => setActiveModal(null)}
                        onSave={() => { triggerRefresh(); setActiveModal(null); }}
                    />
                )}
                {activeModal === 'journal' && (
                    <JournalEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'advantages' && (
                    <AdvantageSectionEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'banner' && (
                    <PromoBannerSettingsModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'campaigns' && (
                    <CampaignEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
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
                {activeModal === 'contact_hero' && (
                    <ContactHeroEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'contact_split_form' && (
                    <ContactSplitFormEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
                    />
                )}
                {activeModal === 'contact_faq' && (
                    <ContactFaqEditorModal
                        onClose={() => setActiveModal(null)}
                        onUpdate={triggerRefresh}
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
            </AnimatePresence>
        </div >
    );
}
