import {
    FiImage, FiColumns, FiAward, FiGrid, FiLayout,
    FiAlignLeft, FiBook, FiTag, FiSidebar, FiMail, FiInfo, FiLock
} from 'react-icons/fi';
import { BsViewStacked } from 'react-icons/bs';
import type { IconType } from 'react-icons';
import { NestedKeyOf } from '@/hooks/useTranslation';
import en from '@/locales/en.json';

export interface ComponentDefinition {
    id: string;
    titleKey: NestedKeyOf<typeof en>;
    descriptionKey: NestedKeyOf<typeof en>;
    icon: IconType;
    image: string;
    category: 'basics' | 'products' | 'content' | 'legal';
    isAvailable: boolean;
    pageSpecific?: boolean;
}

export const COMPONENTS: ComponentDefinition[] = [
    {
        id: 'hero',
        titleKey: 'admin.sections.hero',
        descriptionKey: 'admin.sections.hero_desc',
        icon: FiImage,
        category: 'basics',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="180" height="100" rx="6" fill="currentColor"/><rect x="20" y="20" width="160" height="20" rx="4" fill="#E5E7EB"/><rect x="20" y="50" width="100" height="10" rx="3" fill="#D1D5DB"/><rect x="20" y="70" width="60" height="15" rx="4" fill="#9CA3AF"/><circle cx="100" cy="100" r="4" fill="#9CA3AF"/><circle cx="112" cy="100" r="4" fill="#D1D5DB"/><circle cx="88" cy="100" r="4" fill="#D1D5DB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'page_hero',
        titleKey: 'admin.sections.page_hero',
        descriptionKey: 'admin.sections.page_hero_desc',
        icon: FiImage,
        category: 'basics',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="180" height="100" rx="6" fill="currentColor"/><rect x="50" y="40" width="100" height="10" rx="3" fill="#E5E7EB"/><rect x="70" y="60" width="60" height="6" rx="2" fill="#D1D5DB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'about_hero',
        titleKey: 'admin.sections.about_hero',
        descriptionKey: 'admin.sections.about_hero_desc',
        icon: FiImage,
        category: 'basics',
        pageSpecific: true,
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="180" height="100" rx="6" fill="currentColor"/><circle cx="100" cy="60" r="15" fill="#D1D5DB"/><path d="M95 52l12 8-12 8v-16z" fill="white"/></svg>`,
        isAvailable: true
    },
    {
        id: 'banner',
        titleKey: 'admin.sections.banner',
        descriptionKey: 'admin.sections.banner_desc',
        icon: BsViewStacked,
        category: 'basics',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="25" width="180" height="70" rx="6" fill="currentColor"/><rect x="30" y="55" width="80" height="10" rx="3" fill="#F3F4F6"/></svg>`,
        isAvailable: true
    },
    {
        id: 'featured',
        titleKey: 'admin.sections.featured',
        descriptionKey: 'admin.sections.featured_desc',
        icon: FiColumns,
        category: 'basics',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="85" height="100" rx="6" fill="currentColor"/><rect x="105" y="10" width="85" height="100" rx="6" fill="#F3F4F6"/><rect x="115" y="30" width="65" height="10" rx="3" fill="#D1D5DB"/><rect x="115" y="50" width="40" height="8" rx="3" fill="#E5E7EB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'about_us',
        titleKey: 'admin.sections.about_us',
        descriptionKey: 'admin.sections.about_us_desc',
        icon: FiAward,
        category: 'basics',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="70" height="100" rx="6" fill="currentColor"/><rect x="90" y="20" width="100" height="10" rx="3" fill="#E5E7EB"/><rect x="90" y="40" width="80" height="6" rx="2" fill="#D1D5DB"/><rect x="90" y="60" width="80" height="6" rx="2" fill="#D1D5DB"/><rect x="90" y="80" width="40" height="12" rx="4" fill="currentColor"/></svg>`,
        isAvailable: true
    },
    {
        id: 'collections',
        titleKey: 'admin.sections.collections',
        descriptionKey: 'admin.sections.collections_desc',
        icon: FiGrid,
        category: 'products',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="55" height="55" rx="6" fill="currentColor"/><rect x="72.5" y="10" width="55" height="55" rx="6" fill="#E5E7EB"/><rect x="135" y="10" width="55" height="55" rx="6" fill="#D1D5DB"/><rect x="10" y="75" width="55" height="35" rx="6" fill="#E5E7EB"/><rect x="72.5" y="75" width="55" height="35" rx="6" fill="#D1D5DB"/><rect x="135" y="75" width="55" height="35" rx="6" fill="currentColor"/></svg>`,
        isAvailable: true
    },
    {
        id: 'popular',
        titleKey: 'admin.sections.popular',
        descriptionKey: 'admin.sections.popular_desc',
        icon: FiLayout,
        category: 'products',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="85" height="90" rx="6" fill="currentColor"/><rect x="105" y="10" width="85" height="90" rx="6" fill="currentColor"/><rect x="10" y="105" width="85" height="5" rx="2" fill="#D1D5DB"/><rect x="105" y="105" width="85" height="5" rx="2" fill="#D1D5DB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'legal_content',
        titleKey: 'admin.sections.legal_content',
        descriptionKey: 'admin.sections.legal_content_desc',
        icon: FiAlignLeft,
        category: 'content',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="20" width="180" height="10" rx="2" fill="currentColor"/><rect x="10" y="40" width="180" height="60" rx="4" fill="#E5E7EB"/><rect x="25" y="55" width="150" height="4" rx="2" fill="#D1D5DB"/><rect x="25" y="65" width="130" height="4" rx="2" fill="#D1D5DB"/><rect x="25" y="75" width="140" height="4" rx="2" fill="#D1D5DB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'custom_products',
        titleKey: 'admin.sections.custom_products',
        descriptionKey: 'admin.sections.custom_products_desc',
        icon: FiGrid,
        category: 'products',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="40" height="40" rx="4" fill="currentColor"/><rect x="60" y="10" width="40" height="40" rx="4" fill="currentColor"/><rect x="110" y="10" width="40" height="40" rx="4" fill="#E5E7EB"/><rect x="10" y="60" width="40" height="40" rx="4" fill="#E5E7EB"/><rect x="60" y="60" width="40" height="40" rx="4" fill="currentColor"/><rect x="110" y="60" width="40" height="40" rx="4" fill="currentColor"/></svg>`,
        isAvailable: true
    },
    {
        id: 'product_details',
        titleKey: 'admin.sections.product_details',
        descriptionKey: 'admin.sections.product_details_desc',
        icon: FiTag,
        category: 'products',
        pageSpecific: true,
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="85" height="100" rx="6" fill="#F3F4F6"/><rect x="105" y="10" width="60" height="15" rx="3" fill="currentColor"/><rect x="105" y="35" width="40" height="8" rx="2" fill="#D1D5DB"/><rect x="105" y="55" width="85" height="30" rx="4" fill="#E5E7EB"/><rect x="105" y="95" width="85" height="15" rx="4" fill="currentColor"/></svg>`,
        isAvailable: true
    },
    {
        id: 'related_products',
        titleKey: 'admin.sections.related_products',
        descriptionKey: 'admin.sections.related_products_desc',
        icon: FiGrid,
        category: 'products',
        pageSpecific: true,
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="70" y="5" width="60" height="10" rx="3" fill="currentColor"/><rect x="10" y="25" width="40" height="60" rx="6" fill="#F3F4F6"/><rect x="55" y="25" width="40" height="60" rx="6" fill="#F3F4F6"/><rect x="100" y="25" width="40" height="60" rx="6" fill="#E5E7EB"/><rect x="145" y="25" width="40" height="60" rx="6" fill="#F3F4F6"/></svg>`,
        isAvailable: true
    },
    {
        id: 'journal',
        titleKey: 'admin.sections.journal',
        descriptionKey: 'admin.sections.journal_desc',
        icon: FiBook,
        category: 'content',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="55" height="40" rx="4" fill="currentColor"/><rect x="10" y="55" width="55" height="6" rx="2" fill="#9CA3AF"/><rect x="10" y="65" width="40" height="4" rx="2" fill="#D1D5DB"/><rect x="72.5" y="10" width="55" height="40" rx="4" fill="currentColor"/><rect x="72.5" y="55" width="55" height="6" rx="2" fill="#9CA3AF"/><rect x="72.5" y="65" width="40" height="4" rx="2" fill="#D1D5DB"/><rect x="135" y="10" width="55" height="40" rx="4" fill="currentColor"/><rect x="135" y="55" width="55" height="6" rx="2" fill="#9CA3AF"/><rect x="135" y="65" width="40" height="4" rx="2" fill="#D1D5DB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'campaigns',
        titleKey: 'admin.sections.campaigns',
        descriptionKey: 'admin.sections.campaigns_desc',
        icon: FiTag,
        category: 'content',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="85" height="100" rx="10" fill="currentColor"/><rect x="105" y="10" width="85" height="100" rx="10" fill="currentColor"/><rect x="25" y="70" width="55" height="4" rx="2" fill="#FFFFFF" opacity="0.3"/><rect x="25" y="80" width="40" height="4" rx="2" fill="#FFFFFF" opacity="0.2"/><rect x="120" y="70" width="55" height="4" rx="2" fill="#FFFFFF" opacity="0.3"/><rect x="120" y="80" width="40" height="4" rx="2" fill="#FFFFFF" opacity="0.2"/></svg>`,
        isAvailable: true
    },
    {
        id: 'advantages',
        titleKey: 'admin.sections.advantages',
        descriptionKey: 'admin.sections.advantages_desc',
        icon: FiAward,
        category: 'content',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><circle cx="50" cy="40" r="15" fill="currentColor"/><rect x="30" y="65" width="40" height="4" rx="2" fill="#D1D5DB"/><circle cx="100" cy="40" r="15" fill="currentColor"/><rect x="80" y="65" width="40" height="4" rx="2" fill="#D1D5DB"/><circle cx="150" cy="40" r="15" fill="currentColor"/><rect x="130" y="65" width="40" height="4" rx="2" fill="#D1D5DB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'faq',
        titleKey: 'admin.sections.faq',
        descriptionKey: 'admin.sections.faq_desc',
        icon: FiAlignLeft,
        category: 'content',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="20" width="180" height="15" rx="4" fill="currentColor"/><rect x="10" y="45" width="180" height="15" rx="4" fill="#E5E7EB"/><rect x="10" y="70" width="180" height="15" rx="4" fill="#E5E7EB"/><rect x="10" y="95" width="180" height="15" rx="4" fill="#E5E7EB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'explore_rooms',
        titleKey: 'admin.sections.explore_rooms',
        descriptionKey: 'admin.sections.explore_rooms_desc',
        icon: FiSidebar,
        category: 'content',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="60" height="100" rx="6" fill="currentColor"/><rect x="80" y="10" width="110" height="45" rx="6" fill="#E5E7EB"/><rect x="80" y="65" width="110" height="45" rx="6" fill="#D1D5DB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'about_authenticity',
        titleKey: 'admin.sections.about_authenticity',
        descriptionKey: 'admin.sections.about_authenticity_desc',
        icon: FiSidebar,
        category: 'content',
        pageSpecific: true,
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="20" width="80" height="80" rx="6" fill="#F3F4F6"/><rect x="20" y="40" width="50" height="8" rx="2" fill="#D1D5DB"/><rect x="20" y="60" width="60" height="4" rx="2" fill="#E5E7EB"/><rect x="20" y="70" width="40" height="4" rx="2" fill="#E5E7EB"/><rect x="110" y="10" width="80" height="100" rx="6" fill="currentColor"/></svg>`,
        isAvailable: true
    },
    {
        id: 'about_showcase',
        titleKey: 'admin.sections.about_showcase',
        descriptionKey: 'admin.sections.about_showcase_desc',
        icon: FiColumns,
        category: 'content',
        pageSpecific: true,
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="20" width="85" height="80" rx="4" fill="currentColor"/><circle cx="52.5" cy="60" r="10" fill="#D1D5DB"/><path d="M49 55l8 5-8 5v-10z" fill="white"/><rect x="105" y="20" width="85" height="80" rx="4" fill="currentColor"/></svg>`,
        isAvailable: true
    },
    {
        id: 'about_philosophy',
        titleKey: 'admin.sections.about_philosophy',
        descriptionKey: 'admin.sections.about_philosophy_desc',
        icon: FiBook,
        category: 'content',
        pageSpecific: true,
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><circle cx="100" cy="40" r="20" fill="currentColor"/><rect x="40" y="75" width="120" height="6" rx="3" fill="#D1D5DB"/><rect x="60" y="90" width="80" height="4" rx="2" fill="#E5E7EB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'contact_form',
        titleKey: 'admin.sections.contact_form',
        descriptionKey: 'admin.sections.contact_form_desc',
        icon: FiMail,
        category: 'basics',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="85" height="100" rx="6" fill="currentColor"/><rect x="105" y="10" width="85" height="100" rx="6" fill="#F3F4F6"/><rect x="115" y="30" width="65" height="40" rx="3" fill="#E5E7EB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'contact_info',
        titleKey: 'admin.sections.contact_info',
        descriptionKey: 'admin.sections.contact_info_desc',
        icon: FiInfo,
        category: 'basics',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="110" height="100" rx="6" fill="currentColor"/><rect x="130" y="10" width="60" height="100" rx="6" fill="#F3F4F6"/></svg>`,
        isAvailable: true
    },
    {
        id: 'auth',
        titleKey: 'admin.sections.auth',
        descriptionKey: 'admin.sections.auth_desc',
        icon: FiLock,
        category: 'content',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="40" y="20" width="120" height="80" rx="8" fill="currentColor"/><circle cx="100" cy="50" r="12" fill="#E5E7EB"/><rect x="85" cy="70" width="30" height="10" rx="2" fill="#D1D5DB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'category_listing',
        titleKey: 'admin.sections.category_listing',
        descriptionKey: 'admin.sections.category_listing_desc',
        icon: FiGrid,
        category: 'products',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="180" height="100" rx="6" fill="currentColor"/><rect x="25" y="25" width="45" height="45" rx="4" fill="#E5E7EB"/><rect x="77.5" y="25" width="45" height="45" rx="4" fill="#D1D5DB"/><rect x="130" y="25" width="45" height="45" rx="4" fill="#E5E7EB"/><rect x="25" y="80" width="150" height="10" rx="3" fill="#D1D5DB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'blog_list',
        titleKey: 'admin.sections.blog_list',
        descriptionKey: 'admin.sections.blog_list_desc',
        icon: FiBook,
        category: 'content',
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="180" height="40" rx="4" fill="currentColor"/><rect x="10" y="60" width="85" height="50" rx="4" fill="#E5E7EB"/><rect x="105" y="60" width="85" height="50" rx="4" fill="#E5E7EB"/></svg>`,
        isAvailable: true
    },
    {
        id: 'blog_detail',
        titleKey: 'admin.sections.blog_detail',
        descriptionKey: 'admin.sections.blog_detail_desc',
        icon: FiAlignLeft,
        category: 'content',
        pageSpecific: true,
        image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="180" height="30" rx="4" fill="currentColor"/><rect x="30" y="50" width="140" height="4" rx="2" fill="#D1D5DB"/><rect x="30" y="60" width="140" height="4" rx="2" fill="#D1D5DB"/><rect x="30" y="70" width="100" height="4" rx="2" fill="#D1D5DB"/></svg>`,
        isAvailable: true
    }
];

export const PAGE_RECOMMENDATIONS: Record<string, string[]> = {
    'home': ['hero', 'collections', 'popular', 'featured', 'about_us', 'banner', 'journal', 'campaigns', 'advantages', 'faq', 'explore_rooms'],
    'about': ['about_hero', 'about_authenticity', 'about_showcase', 'about_philosophy', 'about_us', 'advantages', 'legal_content'],
    'contact': ['page_hero', 'contact_form', 'contact_info'],
    'product': ['product_details', 'related_products', 'advantages', 'journal', 'banner'],
    'privacy': ['page_hero', 'legal_content', 'advantages'],
    'terms': ['page_hero', 'legal_content', 'advantages'],
    'accessibility': ['page_hero', 'legal_content', 'advantages'],
    'shop': ['page_hero', 'collections', 'custom_products', 'banner', 'legal_content'],
    'categories': ['page_hero', 'category_listing'],
    'journal': ['blog_list', 'hero', 'banner', 'campaigns'],
    'journal-detail': ['blog_detail', 'advantages', 'legal_content'],
    'login': ['auth'],
    'register': ['auth']
};
