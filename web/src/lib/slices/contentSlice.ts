import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

// --- Interfaces ---

export interface Banner {
    _id: string;
    title: string;
    description: string;
    image: string;
    buttonText: string;
    buttonUrl: string;
    order: number;
    status: 'active' | 'inactive';
    section: 'hero' | 'grid' | 'hero_split';
}

export interface PopularCollectionsContent {
    newArrivals: string;
    bestSellers: string;
}

export interface Advantage {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface AdvantageSection {
    isVisible: boolean;
    title: string;
    advantages: Advantage[];
}

export interface CampaignItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    buttonText: string;
    buttonUrl: string;
}

export interface CampaignSection {
    isVisible: boolean;
    title: string;
    layout: 'grid' | 'split';
    items: CampaignItem[];
}

// 1. Global Settings (Site-wide)
export interface GlobalSettings {
    siteName: string;
    tagline: string;
    logo: string;
    favicon: string;
    footerText: string;
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    metaTitle: string;
    metaDescription: string;
    navigationLinks?: { label: string; path: string }[];
    socialLinks?: { platform: string; url: string }[];
    footerColumns?: {
        title: string;
        links: { label: string; path: string }[];
    }[];
    newsletterTitle?: string;
    newsletterDescription?: string;
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        headingFont?: string;
        bodyFont?: string;
        cardStyle?: 'classic' | 'minimal' | 'modern';
    };
    navbarLayout?: 'classic' | 'centered' | 'minimal' | 'horizontal';
    footerLayout?: 'classic' | 'minimal' | 'magazine' | 'centered';
    topBannerText?: string;
    navbarMenuLabel?: string;
    navbarSubHeaderText?: string;
    showTopBanner?: boolean;
    showSubHeader?: boolean;
    navbarAccountLabel?: string;
    navbarContactLabel?: string;
    navbarDiscoverText?: string;
    currency?: string;
}

// 2. Home Page Settings (Specific to Home)
export interface HomeSettings {
    heroLayout?: 'video' | 'slider' | 'split';
    heroVideoUrl?: string; // If 'video' layout
    heroImageUrl?: string; // If not 'video' layout
    heroTitle?: string;
    heroDescription?: string;
    heroButtonText?: string;
    heroButtonUrl?: string;
    featuredSection?: {
        isVisible: boolean;
        title: string;
        description: string;
        mediaUrl: string;
        mediaType: 'video' | 'image';
        buttonText: string;
        buttonUrl: string;
        layout: 'left' | 'right';
        overlayTitle?: string;
        overlayDescription?: string;
    };
    sectionOrder?: string[];
    hiddenSections?: string[];
    categoryLayout?: 'carousel' | 'grid' | 'masonry' | 'minimal';
    popularLayout?: 'grid' | 'split' | 'stacked';
    bannerLayout?: 'classic' | 'split' | 'minimal';
    journalLayout?: 'grid' | 'list' | 'magazine';
    advantageSection?: AdvantageSection;
    campaignSection?: CampaignSection;
}

// 3. Product Page Settings
export interface ProductSettings {
    layout?: {
        imageGallery?: 'carousel' | 'grid' | 'thumbnails-left' | 'thumbnails-bottom';
        infoBox?: 'minimal' | 'detailed' | 'classic';
        showBadges?: boolean;
        showRelatedProducts?: boolean;
        showBreadcrumbs?: boolean;
        showMaterialCategory?: boolean;
    };
    relatedProductsLayout?: {
        title: string;
        displayType: 'grid' | 'slider' | 'minimal';
        itemsCount: number;
    };
    sectionOrder?: string[];
    hiddenSections?: string[];
    advantageSection?: AdvantageSection;
    bannerLayout?: 'classic' | 'split' | 'minimal';
    journalLayout?: 'grid' | 'list' | 'magazine';
}

// 4. About Page Settings
export interface AboutSettings {
    hero?: {
        isVisible: boolean;
        title: string;
        subtitle: string;
        videoUrl: string;
        layout?: string;
    };
    authenticity?: {
        isVisible: boolean;
        tagline: string;
        titlePart1: string;
        titlePart2: string;
        description: string;
        imageUrl: string;
        buttonText: string;
        layout?: string;
    };
    showcase?: {
        isVisible: boolean;
        title: string;
        subtitle: string;
        videoUrl: string;
        videoLabel: string;
        imageUrl: string;
        imageLabel: string;
        layout?: string;
    };
    philosophy?: {
        isVisible: boolean;
        quote: string;
        imageUrl: string;
        tagline: string;
        backgroundText: string;
        layout?: string;
    };
    sectionOrder?: string[];
    hiddenSections?: string[];
}

// 5. Contact Page Settings
export interface ContactSettings {
    hero?: {
        isVisible: boolean;
        title: string;
        subtitle: string;
        backgroundImageUrl: string;
    };
    splitForm?: {
        isVisible: boolean;
        title: string;
        description: string;
        mediaUrl: string;
        mediaType: 'image' | 'video' | 'map';
    };
    faq?: {
        isVisible: boolean;
        title: string;
        faqs: { question: string; answer: string }[];
        supportText: string;
        supportEmail: string;
        supportPhone: string;
    };
    sectionOrder?: string[];
    hiddenSections?: string[];
}

// 6. Auth Pages Settings
export interface AuthSettings {
    login?: {
        layout: 'split-left' | 'split-right' | 'centered';
        title: string;
        quote: string;
        imageUrl: string;
    };
    register?: {
        layout: 'split-left' | 'split-right' | 'centered';
        title: string;
        quote: string;
        imageUrl: string;
    };
}

// 7. Legal Pages Settings (Generic for Privacy, Terms, Accessibility)
export interface LegalSettings {
    title: string;
    content: string; // HTML/Markdown content
    lastUpdated?: string;
}

// --- State ---

interface ContentState {
    banners: Banner[];
    popularCollections: PopularCollectionsContent;
    globalSettings: GlobalSettings;
    homeSettings: HomeSettings;
    productSettings: ProductSettings;
    aboutSettings: AboutSettings;
    contactSettings: ContactSettings; // New state
    authSettings: AuthSettings;
    privacySettings: LegalSettings;
    termsSettings: LegalSettings;
    accessibilitySettings: LegalSettings;
    isLoading: boolean;
    error: string | null;
}

const initialState: ContentState = {
    banners: [],
    popularCollections: {
        newArrivals: '',
        bestSellers: ''
    },
    globalSettings: {
        siteName: 'Ocean Gem',
        tagline: 'Premium Jewelry',
        logo: '',
        favicon: '',
        footerText: '© 2026 Ocean Gem. All rights reserved.',
        contactEmail: '',
        contactPhone: '',
        contactAddress: '',
        metaTitle: 'Ocean Gem E-Commerce',
        metaDescription: 'Shop the finest jewelry.',
        theme: {
            primaryColor: '#C5A059',
            secondaryColor: '#000000',
            backgroundColor: '#ffffff',
            textColor: '#18181b', // zinc-900
            headingFont: 'Playfair Display',
            bodyFont: 'Inter',
            cardStyle: 'classic',
        },
        navbarLayout: 'classic',
        footerLayout: 'classic',
        topBannerText: 'FAMILY-OWNED AND OPERATED IN NEW YORK CITY',
        navbarMenuLabel: 'Menu',
        navbarSubHeaderText: 'Exquisite Treasures From The Deep',
        showTopBanner: true,
        showSubHeader: true,
        navbarAccountLabel: 'Account',
        navbarContactLabel: 'Contact Us',
        navbarDiscoverText: 'Discover',
        currency: 'USD',
        navigationLinks: [
            { label: 'Our Story', path: '/about' },
            { label: 'Collections', path: '/collections' },
            { label: 'Journal', path: '/journal' },
            { label: 'Gift Guide', path: '/products?tag=best-seller' }
        ],
        footerColumns: [
            {
                title: 'Client Care', links: [
                    { label: 'Shipping & Returns', path: '/shipping' },
                    { label: 'FAQ', path: '/faq' },
                    { label: 'Size Guide', path: '/size-guide' }
                ]
            },
            {
                title: 'Legal', links: [
                    { label: 'Privacy Policy', path: '/privacy' },
                    { label: 'Terms of Service', path: '/terms' }
                ]
            }
        ],
        socialLinks: [
            { platform: 'Instagram', url: 'https://instagram.com' },
            { platform: 'Facebook', url: 'https://facebook.com' }
        ],
        newsletterTitle: 'Join the Inner Circle',
        newsletterDescription: 'Unlock exclusive access to new collections and private events.',
    },
    // Default Home Settings
    homeSettings: {
        heroLayout: 'video',
        heroVideoUrl: '/videos/hero.mp4',
        heroTitle: 'Timeless Luxury',
        heroDescription: 'Our rich collection of timeless and classic styles all in one place',
        heroButtonText: 'Shop Collection',
        heroButtonUrl: '/collections',
        featuredSection: {
            isVisible: true,
            title: 'Mastery in Diamond-Cut Patterns',
            description: 'Our signature hand-engraved collection reflects the rhythmic beauty of the tides, transformed into timeless gold and diamond masterpieces.',
            mediaUrl: '/videos/video2.mp4',
            mediaType: 'video',
            buttonText: 'DISCOVER THE DEEP',
            buttonUrl: '/collections',
            layout: 'left',
            overlayTitle: 'Ocean Gem Artisans',
            overlayDescription: '"Every wave tells a story, every gem captures an ocean dream."'
        },
        sectionOrder: ['hero', 'featured', 'collections', 'banner', 'popular'],
        hiddenSections: ['advantages', 'journal'],
        advantageSection: {
            isVisible: false,
            title: 'Why Choose Us',
            advantages: [
                { id: '1', title: 'Free Shipping', description: 'On all orders over $200', icon: 'FiTruck' },
                { id: '2', title: 'Secure Payment', description: 'Your data is protected', icon: 'FiLock' },
                { id: '3', title: 'Luxury Packaging', description: 'Every gift is special', icon: 'FiGift' }
            ]
        },
        campaignSection: {
            isVisible: false,
            title: 'Limited Offers',
            layout: 'grid',
            items: [
                { id: '1', title: 'Seasonal Sale', subtitle: 'Up to 50% off on all Necklaces', image: '/image/hero_bg.jpg', buttonText: 'Shop Sale', buttonUrl: '/collections' },
                { id: '2', title: 'Bundle & Save', subtitle: 'Buy 2 rings, get 1 free', image: '/image/hero_bg.jpg', buttonText: 'View Offer', buttonUrl: '/collections' }
            ]
        }
    },
    // Default Product Settings
    productSettings: {
        layout: {
            imageGallery: 'thumbnails-left',
            infoBox: 'detailed',
            showBadges: true,
            showRelatedProducts: true,
            showBreadcrumbs: true,
            showMaterialCategory: true,
        },
        sectionOrder: ['product_details', 'related_products', 'advantages', 'journal', 'banner'],
        hiddenSections: ['advantages', 'journal', 'banner'],
    },
    // Default About Settings
    aboutSettings: {
        hero: {
            isVisible: true,
            title: 'Our Story',
            subtitle: 'The Essence of Elegance',
            videoUrl: '/videos/about_hero.mp4',
            layout: 'fullscreen',
        },
        authenticity: {
            isVisible: true,
            tagline: 'CRAFTSMANSHIP',
            titlePart1: 'Captured in',
            titlePart2: 'the Moment',
            description: '"Beauty is not just in the final piece, but in the meticulous journey of its creation. We capture every spark, every carve, and every reflection."',
            imageUrl: '/image/customer/WhatsApp Image 2026-02-06 at 01.01.21.jpeg',
            buttonText: 'Behind the scenes',
            layout: 'image-right',
        },
        showcase: {
            isVisible: true,
            title: 'Pure Reflections',
            subtitle: 'Real moments, real beauty',
            videoUrl: '/videos/about_video.mp4',
            videoLabel: 'The Glow',
            imageUrl: '/image/customer/WhatsApp Image 2026-02-06 at 01.01.19n.jpeg',
            imageLabel: 'The Craft',
            layout: 'grid-2-col',
        },
        philosophy: {
            isVisible: true,
            quote: '"Real elegance is found in the raw, personal moments of craftsmanship."',
            imageUrl: '/image/customer/WhatsApp Image 2026-02-06 at 01.01.20.jpeg',
            tagline: 'OUR PHILOSOPHY',
            backgroundText: 'Exquisite',
            layout: 'centered-quote',
        },
        sectionOrder: ['about_hero', 'about_authenticity', 'about_showcase', 'about_philosophy'],
        hiddenSections: [],
    },
    // Default Contact Settings
    contactSettings: {
        hero: {
            isVisible: true,
            title: 'Contact Us',
            subtitle: "We'd love to hear from you",
            backgroundImageUrl: '/image/hero_bg.jpg'
        },
        splitForm: {
            isVisible: true,
            title: 'Get in Touch',
            description: 'Fill out the form below and our team will get back to you shortly.',
            mediaUrl: '/image/customer/WhatsApp Image 2026-02-06 at 01.01.21.jpeg',
            mediaType: 'image'
        },
        faq: {
            isVisible: true,
            title: 'Frequently Asked Questions',
            faqs: [
                { question: 'Do you offer international shipping?', answer: 'Yes, we ship worldwide.' },
                { question: 'What is your return policy?', answer: 'We accept returns within 30 days of purchase.' }
            ],
            supportText: 'Still have questions?',
            supportEmail: 'support@oceangem.com',
            supportPhone: '+1 (555) 123-4567'
        },
        sectionOrder: ['contact_hero', 'contact_split_form', 'contact_faq'],
        hiddenSections: []
    },
    // Default Auth Settings
    authSettings: {
        login: {
            layout: 'split-left',
            title: 'Welcome Back',
            quote: 'Exclusive collections, early access rights, and personal style consultancy await you.',
            imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=1200'
        },
        register: {
            layout: 'split-left',
            title: 'Create Account',
            quote: 'Join our exclusive community and discover the world of OCEAN GEM.',
            imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200'
        }
    },
    privacySettings: {
        title: 'Privacy Policy',
        content: '<h1>Privacy Policy</h1><p>Our commitment to your privacy...</p>'
    },
    termsSettings: {
        title: 'Terms of Service',
        content: '<h1>Terms of Service</h1><p>Our standard terms...</p>'
    },
    accessibilitySettings: {
        title: 'Accessibility Statement',
        content: '<h1>Accessibility Statement</h1><p>We care about accessibility...</p>'
    },
    isLoading: false,
    error: null,
};

// --- Thunks ---

// Banners (Unchanged)
export const fetchBanners = createAsyncThunk(
    'content/fetchBanners',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/public/banners');
            if (response.data.success) return response.data.data;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPopularCollectionsContent = createAsyncThunk(
    'content/fetchPopularCollectionsContent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/public/section-content/popular_collections');
            if (response.data.success && response.data.data.content) return response.data.data.content;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Admin Banners
export const fetchAdminBanners = createAsyncThunk(
    'content/fetchAdminBanners',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/banners');
            if (response.data.success) return response.data.data;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createBanner = createAsyncThunk(
    'content/createBanner',
    async (bannerData: Partial<Banner>, { rejectWithValue }) => {
        try {
            const response = await api.post('/banners', bannerData);
            if (response.data.success) return response.data.data;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateBanner = createAsyncThunk(
    'content/updateBanner',
    async ({ id, data }: { id: string; data: Partial<Banner> }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/banners/${id}`, data);
            if (response.data.success) return response.data.data;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteBanner = createAsyncThunk(
    'content/deleteBanner',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/banners/${id}`);
            if (response.data.success) return id;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Admin Popular Collections
export const fetchAdminPopularCollections = createAsyncThunk(
    'content/fetchAdminPopularCollections',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/section-content/popular_collections');
            if (response.data.success && response.data.data.content) return response.data.data.content;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updatePopularCollections = createAsyncThunk(
    'content/updatePopularCollections',
    async (content: PopularCollectionsContent, { rejectWithValue }) => {
        try {
            const response = await api.put('/section-content/popular_collections', { content });
            if (response.data.success) return content;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// --- Global Settings (Cleaned Up) ---
export const fetchGlobalSettings = createAsyncThunk(
    'content/fetchGlobalSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/public/section-content/global_settings');
            if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) return response.data.data.content;
            return initialState.globalSettings; // Return default if empty
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateGlobalSettings = createAsyncThunk(
    'content/updateGlobalSettings',
    async (content: GlobalSettings, { rejectWithValue }) => {
        try {
            const response = await api.put('/section-content/global_settings', { content });
            if (response.data.success) return content;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// --- NEW: Home Settings ---
export const fetchHomeSettings = createAsyncThunk(
    'content/fetchHomeSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/public/section-content/home_settings');
            if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) return response.data.data.content;
            return initialState.homeSettings; // Return default
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAdminHomeSettings = createAsyncThunk(
    'content/fetchAdminHomeSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/section-content/home_settings');
            if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) return response.data.data.content;
            return initialState.homeSettings;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateHomeSettings = createAsyncThunk(
    'content/updateHomeSettings',
    async (content: HomeSettings, { rejectWithValue }) => {
        try {
            const response = await api.put('/section-content/home_settings', { content });
            if (response.data.success) return content;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// --- NEW: Product Settings ---
export const fetchProductSettings = createAsyncThunk(
    'content/fetchProductSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/public/section-content/product_settings');
            if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) return response.data.data.content;
            return initialState.productSettings; // Return default
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAdminProductSettings = createAsyncThunk(
    'content/fetchAdminProductSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/section-content/product_settings');
            if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) return response.data.data.content;
            return initialState.productSettings;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateProductSettings = createAsyncThunk(
    'content/updateProductSettings',
    async (content: ProductSettings, { rejectWithValue }) => {
        try {
            const response = await api.put('/section-content/product_settings', { content });
            if (response.data.success) return content;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// --- NEW: About Settings ---
export const fetchAboutSettings = createAsyncThunk(
    'content/fetchAboutSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/public/section-content/about_settings');
            if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) return response.data.data.content;
            return initialState.aboutSettings; // Return default
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAdminAboutSettings = createAsyncThunk(
    'content/fetchAdminAboutSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/section-content/about_settings');
            if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) return response.data.data.content;
            return initialState.aboutSettings;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateAboutSettings = createAsyncThunk(
    'content/updateAboutSettings',
    async (content: AboutSettings, { rejectWithValue }) => {
        try {
            const response = await api.put('/section-content/about_settings', { content });
            if (response.data.success) return content;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// --- NEW: Contact Settings ---
export const fetchContactSettings = createAsyncThunk(
    'content/fetchContactSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/public/section-content/contact_settings');
            if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) return response.data.data.content;
            return initialState.contactSettings; // Return default
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAdminContactSettings = createAsyncThunk(
    'content/fetchAdminContactSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/section-content/contact_settings');
            if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) return response.data.data.content;
            return initialState.contactSettings;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateContactSettings = createAsyncThunk(
    'content/updateContactSettings',
    async (content: ContactSettings, { rejectWithValue }) => {
        try {
            const response = await api.put('/section-content/contact_settings', { content });
            if (response.data.success) return content;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// --- NEW: Auth Settings ---
export const fetchAuthSettings = createAsyncThunk(
    'content/fetchAuthSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/public/section-content/auth_settings');
            if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) return response.data.data.content;
            return initialState.authSettings; // Return default
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAdminAuthSettings = createAsyncThunk(
    'content/fetchAdminAuthSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/section-content/auth_settings');
            if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) return response.data.data.content;
            return initialState.authSettings;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateAuthSettings = createAsyncThunk(
    'content/updateAuthSettings',
    async (content: AuthSettings, { rejectWithValue }) => {
        try {
            const response = await api.put('/section-content/auth_settings', { content });
            if (response.data.success) return content;
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// --- NEW: Legal Settings ---
export const fetchLegalSettings = createAsyncThunk(
    'content/fetchLegalSettings',
    async (type: 'privacy_policy' | 'terms_of_service' | 'accessibility', { rejectWithValue }) => {
        try {
            const response = await api.get(`/public/section-content/${type}`);
            if (response.data.success && response.data.data.content && Object.keys(response.data.data.content).length > 0) {
                return { type, content: response.data.data.content };
            }
            return { type, content: null };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateLegalSettings = createAsyncThunk(
    'content/updateLegalSettings',
    async ({ type, content }: { type: 'privacy_policy' | 'terms_of_service' | 'accessibility', content: LegalSettings }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/section-content/${type}`, { content });
            if (response.data.success) return { type, content };
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const contentSlice = createSlice({
    name: 'content',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Banners
            .addCase(fetchBanners.fulfilled, (state, action) => { state.banners = action.payload; })
            .addCase(fetchAdminBanners.fulfilled, (state, action) => { state.banners = action.payload; })
            .addCase(createBanner.fulfilled, (state, action) => { state.banners.push(action.payload); })
            .addCase(updateBanner.fulfilled, (state, action) => {
                const index = state.banners.findIndex(b => b._id === action.payload._id);
                if (index !== -1) state.banners[index] = action.payload;
            })
            .addCase(deleteBanner.fulfilled, (state, action) => {
                state.banners = state.banners.filter(b => b._id !== action.payload);
            })
            // Popular Collections
            .addCase(fetchPopularCollectionsContent.fulfilled, (state, action) => { state.popularCollections = action.payload; })
            .addCase(fetchAdminPopularCollections.fulfilled, (state, action) => { state.popularCollections = action.payload; })
            .addCase(updatePopularCollections.fulfilled, (state, action) => { state.popularCollections = action.payload; })
            // Global Settings
            .addCase(fetchGlobalSettings.fulfilled, (state, action) => { state.globalSettings = action.payload; })
            .addCase(updateGlobalSettings.fulfilled, (state, action) => { state.globalSettings = action.payload; })
            // Home Settings
            .addCase(fetchHomeSettings.fulfilled, (state, action) => { state.homeSettings = action.payload; })
            .addCase(fetchAdminHomeSettings.fulfilled, (state, action) => { state.homeSettings = action.payload; })
            .addCase(updateHomeSettings.fulfilled, (state, action) => { state.homeSettings = action.payload; })
            // Product Settings
            .addCase(fetchProductSettings.fulfilled, (state, action) => { state.productSettings = action.payload; })
            .addCase(fetchAdminProductSettings.fulfilled, (state, action) => { state.productSettings = action.payload; })
            .addCase(updateProductSettings.fulfilled, (state, action) => { state.productSettings = action.payload; })
            // About Settings
            .addCase(fetchAboutSettings.fulfilled, (state, action) => { state.aboutSettings = action.payload; })
            .addCase(fetchAdminAboutSettings.fulfilled, (state, action) => { state.aboutSettings = action.payload; })
            .addCase(updateAboutSettings.fulfilled, (state, action) => { state.aboutSettings = action.payload; })
            // Contact Settings
            .addCase(fetchContactSettings.fulfilled, (state, action) => { state.contactSettings = action.payload; })
            .addCase(fetchAdminContactSettings.fulfilled, (state, action) => { state.contactSettings = action.payload; })
            .addCase(updateContactSettings.fulfilled, (state, action) => { state.contactSettings = action.payload; })
            // Auth Settings
            .addCase(fetchAuthSettings.fulfilled, (state, action) => { state.authSettings = action.payload; })
            .addCase(fetchAdminAuthSettings.fulfilled, (state, action) => { state.authSettings = action.payload; })
            .addCase(updateAuthSettings.fulfilled, (state, action) => { state.authSettings = action.payload; })
            // Legal Settings
            .addCase(fetchLegalSettings.fulfilled, (state, action) => {
                if (action.payload.content) {
                    if (action.payload.type === 'privacy_policy') state.privacySettings = action.payload.content;
                    else if (action.payload.type === 'terms_of_service') state.termsSettings = action.payload.content;
                    else if (action.payload.type === 'accessibility') state.accessibilitySettings = action.payload.content;
                }
            })
            .addCase(updateLegalSettings.fulfilled, (state, action) => {
                if (action.payload.type === 'privacy_policy') state.privacySettings = action.payload.content;
                else if (action.payload.type === 'terms_of_service') state.termsSettings = action.payload.content;
                else if (action.payload.type === 'accessibility') state.accessibilitySettings = action.payload.content;
            });
    },
});

export const { clearError } = contentSlice.actions;
export default contentSlice.reducer;
