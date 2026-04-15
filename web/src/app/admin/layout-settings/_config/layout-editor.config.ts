import {
    FiHome, FiLayout, FiGrid, FiUser, FiMapPin, FiSettings, FiShoppingBag, FiTag, FiLock, FiShield, FiActivity,
    FiMenu, FiGlobe, FiPhone, FiSearch, FiImage, FiStar, FiLayers, FiAward, FiMonitor, FiBook, FiMail, FiInfo, FiAlignLeft, FiSidebar
} from 'react-icons/fi';
import { PageSection } from '@/types/page';
import type { IconType } from 'react-icons';
import { Translate } from '@/hooks/useTranslation';

export const SYSTEM_SLUGS = [
    'home', 'about', 'contact', 'login', 'register', 'product-detail', 'privacy-policy', 'terms-of-service', 'accessibility', 'categories', 'collections', 'journal', 'journal-detail'
];



export interface PageConfigItem {
    id: string;
    label: string;
    path: string;
    desc: string;
    category: 'general' | 'core' | 'catalog' | 'auth' | 'legal' | 'custom';
    icon: IconType;
    slug?: string;
}

export const getPagesConfig = (t: Translate): PageConfigItem[] => [
    { id: 'global', label: t('admin.globalSettings.settings') || 'Settings', path: '/', icon: FiSettings, desc: t('admin.pages.desc_global'), category: 'general' },
    { id: 'home', label: t('footer.home') || 'Home', path: '/', icon: FiHome, desc: t('admin.pages.desc_home'), category: 'core' },
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
    { id: 'journal', label: t('admin.pages.journal') || 'Journal', path: '/journal', icon: FiBook, desc: t('admin.pages.desc_journal') || 'Manage journal listing', category: 'core' },
    { id: 'journal-detail', label: t('admin.pages.journal-detail') || 'Blog Detail', path: '/journal/demo', slug: 'journal-detail', icon: FiAlignLeft, desc: t('admin.pages.desc_journal-detail') || 'Manage blog post layout', category: 'core' },
];

export const getInitialSectionsConfig = (t: Translate): Record<string, PageSection[]> => ({
    global: [
        { id: 'identity', label: t('admin.globalSettings.identity.title') || 'Identity', description: t('admin.sections.identity_desc'), isActive: true, hasSettings: true },
        { id: 'theme', label: t('admin.globalSettings.theme.title') || 'Theme', description: t('admin.sections.theme_desc'), isActive: true, hasSettings: true },
        { id: 'navbar', label: t('admin.globalSettings.navbar.title') || 'Navbar', description: t('admin.sections.navbar_desc'), isActive: true, hasSettings: true },
        { id: 'footer_contact', label: t('admin.sections.footer_contact'), description: t('admin.sections.footer_contact_desc'), isActive: true, hasSettings: true },
        { id: 'seo', label: t('admin.globalSettings.seo.title') || 'SEO', description: t('admin.sections.seo_desc'), isActive: true, hasSettings: true },
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

export const SECTION_ICONS_CONFIG: Record<string, IconType> = {
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
    filters: FiLayout,
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
    legal_content: FiAlignLeft,
    blog_list: FiBook,
    blog_detail: FiMonitor
};

export const PAGE_CATEGORIES_CONFIG = (t: Translate) => [
    { id: 'general', label: t('admin.groupCategories.general') || (t('admin.globalSettings.settings') || 'Genel Ayarlar') },
    { id: 'core', label: t('admin.groupCategories.pages') || (t('admin.mainPages') || 'Ana Sayfalar') },
    { id: 'catalog', label: t('admin.groupCategories.catalog') || (t('admin.explore') || 'Katalog Menüsü') },
    { id: 'auth', label: t('admin.groupCategories.auth') || (t('common.account') || 'Üyelik Sayfaları') },
    { id: 'legal', label: t('admin.groupCategories.legal') || (t('admin.pages.privacy') || 'Bilgi & Yasal') },
    { id: 'custom', label: t('admin.groupCategories.custom') || (t('admin.addPage') || 'Ek Sayfalar') },
];

export const MODAL_MAPPING_CONFIG: Record<string, string> = {
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
    blog_list: 'blog_list_edit',
    blog_detail: 'blog_detail_edit',
    auth: 'auth_logic_placeholder' // Special case handled in hook
};
