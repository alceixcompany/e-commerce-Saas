// --- Content Domain Types ---

export interface Banner {
    _id: string;
    title: string;
    description: string;
    image: string;
    buttonText: string;
    buttonUrl: string;
    order: number;
    status: 'active' | 'inactive';
    section: string;
}

export interface PopularCollectionsContent {
    newArrivals: string;
    bestSellers: string;
    newArrivalsTitle?: string;
    newArrivalsLink?: string;
    bestSellersTitle?: string;
    bestSellersLink?: string;
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
    activeLanguage?: 'en' | 'tr';
    storeUrl?: string;
    shippingFee?: number;
    taxRate?: number;
}

export interface HomeSettings {
    heroLayout?: 'video' | 'slider' | 'split';
    heroVideoUrl?: string;
    heroImageUrl?: string;
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

export interface ContactSettings {
    hero?: {
        isVisible: boolean;
        title: string;
        subtitle: string;
        backgroundImageUrl: string;
        variant?: 'classic' | 'split' | 'minimal';
    };
    splitForm?: {
        isVisible: boolean;
        title: string;
        description: string;
        mediaUrl: string;
        mediaType: 'image' | 'video' | 'map';
        variant?: 'side-by-side' | 'stacked' | 'clean';
    };
    faq?: {
        isVisible: boolean;
        title: string;
        faqs: { question: string; answer: string }[];
        supportText: string;
        supportEmail: string;
        supportPhone: string;
        supportAddress?: string;
        socialLinks?: { platform: string; url: string }[];
        variant?: 'split' | 'grid' | 'stacked';
    };
    sectionOrder?: string[];
    hiddenSections?: string[];
}

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

export interface LegalSettings {
    title: string;
    content: string;
    lastUpdated?: string;
    sectionOrder?: string[];
    hiddenSections?: string[];
}
