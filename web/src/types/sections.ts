
export interface HeroData {
    heroLayout?: 'video' | 'slider' | 'split';
    heroTitle?: string;
    heroVideoUrl?: string;
    heroImageUrl?: string;
    heroDescription?: string;
    heroButtonText?: string;
    heroButtonUrl?: string;
}

export interface PageHeroData {
    title?: string;
    subtitle?: string;
    backgroundImageUrl?: string;
    variant?: 'classic' | 'split' | 'minimal';
}

export interface FeaturedData {
    isVisible?: boolean;
    title?: string;
    description?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    buttonText?: string;
    buttonUrl?: string;
    layout?: 'left' | 'right';
    overlayTitle?: string;
    overlayDescription?: string;
}

export interface CollectionsData {
    categoryLayout?: 'carousel' | 'grid' | 'minimal' | 'masonry';
}

export interface HomeBannerData {
    bannerLayout?: 'classic' | 'split' | 'minimal';
}

export interface PopularCollectionsData {
    popularLayout?: 'grid' | 'split' | 'stacked';
    newArrivals?: string;
    bestSellers?: string;
    newArrivalsTitle?: string;
    newArrivalsLink?: string;
    bestSellersTitle?: string;
    bestSellersLink?: string;
}

export interface HomeJournalData {
    journalLayout?: 'grid' | 'list' | 'magazine';
    journalTitle?: string;
    journalSubtitle?: string;
}

export interface AdvantageItem {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export interface AdvantageData {
    title?: string;
    isVisible?: boolean;
    items?: AdvantageItem[];
    advantages?: AdvantageItem[];
}

export interface CampaignItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    buttonText: string;
    buttonUrl: string;
}

export interface CampaignData {
    isVisible?: boolean;
    title?: string;
    layout?: 'split' | 'grid' | 'grid-3-col';
    items?: CampaignItem[];
}

export interface FAQItem {
    id: string | number;
    question: string;
    answer: string;
}

export interface FAQData {
    isVisible?: boolean;
    title?: string;
    subtitle?: string;
    items?: FAQItem[];
}

export interface RoomCategory {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
}

export interface ExploreByRoomData {
    isVisible?: boolean;
    title?: string;
    subtitle?: string;
    rooms?: RoomCategory[];
    variant?: 'list' | 'grid' | 'focus';
}

export interface Feature {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface AboutUsData {
    isVisible?: boolean;
    // Hero Section
    title?: string;
    subtitle?: string;
    videoUrl?: string;
    layout?: 'default' | 'split' | 'centered' | 'reverse' | string;
    // Authenticity Section
    tagline?: string;
    titlePart1?: string;
    titlePart2?: string;
    description?: string;
    imageUrl?: string;
    buttonText?: string;
    // Legacy mapping (to avoid breaks in SectionRenderer)
    heroTitle?: string;
    heroDesc?: string;
    heroSubtitle?: string;
    heroVideoUrl?: string;
    heroLayout?: string;
    variant?: 'default' | 'split' | 'centered' | 'reverse' | string;
    mediaUrl?: string;
    authenticityTagline?: string;
    authenticityTitlePart1?: string;
    authenticityTitlePart2?: string;
    authenticityDescription?: string;
    authenticityImageUrl?: string;
    authenticityButtonText?: string;
    authenticityLayout?: string;
    features?: Feature[];
}

export interface AuthData {
    type: 'login' | 'register';
    title?: string;
    subtitle?: string;
    tagline?: string;
    imageUrl?: string;
    layout?: 'split-left' | 'split-right' | 'centered';
    buttonText?: string;
    quote?: string; // Support for some DB schemas
}

export interface PromoBannerData {
    isVisible?: boolean;
    variant?: 'classic' | 'split' | 'minimal';
    title?: string;
    subtitle?: string;
    image?: string;
    buttonText?: string;
    buttonUrl?: string;
    bannerLayout?: 'classic' | 'split' | 'minimal';
}

export interface PhilosophyData {
    isVisible?: boolean;
    imageUrl?: string;
    quote?: string;
    tagline?: string;
    backgroundText?: string;
}

export interface ShowcaseData {
    isVisible?: boolean;
    layout?: 'masonry' | 'grid-2-col';
    title?: string;
    subtitle?: string;
    videoUrl?: string;
    imageUrl?: string;
}

export interface CustomProductsData {
    isVisible?: boolean;
    title?: string;
    subtitle?: string;
    productIds?: string[];
    variant?: 'grid' | 'slider' | 'focused';
}

export interface LegalData {
    title: string;
    content: string;
    lastUpdated?: string;
    variant?: 'standard' | 'compact' | 'boxed';
}

export interface ContactFormData {
    title: string;
    description: string;
    mediaType: 'image' | 'video' | 'map';
    mediaUrl: string;
    buttonText?: string;
    variant?: 'side-by-side' | 'stacked' | 'clean';
}

export interface ContactInfoData {
    title: string;
    faqs: { question: string; answer: string }[];
    supportText: string;
    supportEmail: string;
    supportPhone: string;
    supportAddress?: string;
    socialLinks?: { platform: string; url: string }[];
    variant?: 'split' | 'grid' | 'stacked';
    [key: string]: unknown;
}

export interface BlogListData {
    title?: string;
    subtitle?: string;
    description?: string;
    variant?: 'editorial' | 'magazine' | 'minimal' | 'zigzag' | 'masonry' | 'grid_compact';
    itemsPerPage?: number;
}

export interface BlogDetailData {
    variant?: 'editorial' | 'focused' | 'wide' | 'immersive' | 'modern_sidebar' | 'minimalist';
    showRecommended?: boolean;
    recommendedTitle?: string;
}

export interface CategoryListingData {
    title?: string;
    subtitle?: string;
    layout?: 'grid' | 'masonry' | 'slider' | 'minimal';
    columns?: 2 | 3 | 4;
    showItemCount?: boolean;
    imageAspectRatio?: 'square' | 'portrait';
}

export type SectionData =
    | HeroData
    | FeaturedData
    | CollectionsData
    | HomeBannerData
    | PopularCollectionsData
    | HomeJournalData
    | AdvantageData
    | CampaignData
    | FAQData
    | ExploreByRoomData
    | AboutUsData
    | PhilosophyData
    | ShowcaseData
    | CustomProductsData
    | LegalData
    | ContactFormData
    | ContactInfoData
    | BlogListData
    | BlogDetailData
    | CategoryListingData
    | PageHeroData;
