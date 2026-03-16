'use client';

import { FiX, FiCheck, FiLayout, FiImage, FiGrid, FiAlignLeft, FiSidebar, FiColumns, FiBook, FiAward, FiPlus, FiTag } from 'react-icons/fi';
import { BsViewStacked } from 'react-icons/bs';

interface ComponentDefinition {
    id: string;
    title: string;
    description: string;
    icon: any;
    image: string;
    isAvailable: boolean;
    recommendedPages: string[];
}

export default function ComponentStoreModal({
    onClose,
    onAdd,
    activeIds,
    pageType = 'home'
}: {
    onClose: () => void;
    onAdd: (id: string) => void;
    activeIds: string[];
    pageType?: string;
}) {

    const components: ComponentDefinition[] = [
        {
            id: 'hero',
            title: 'Hero Slider',
            description: 'Full-width edge-to-edge interactive slider or video background.',
            icon: FiImage,
            recommendedPages: ['home'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="180" height="100" rx="6" fill="currentColor"/><rect x="20" y="20" width="160" height="20" rx="4" fill="#E5E7EB"/><rect x="20" y="50" width="100" height="10" rx="3" fill="#D1D5DB"/><rect x="20" y="70" width="60" height="15" rx="4" fill="#9CA3AF"/><circle cx="100" cy="100" r="4" fill="#9CA3AF"/><circle cx="112" cy="100" r="4" fill="#D1D5DB"/><circle cx="88" cy="100" r="4" fill="#D1D5DB"/></svg>`,
            isAvailable: true
        },
        {
            id: 'featured',
            title: 'Split Screen Layout',
            description: 'Perfectly balanced 50/50 split with image/video and rich typography.',
            icon: FiColumns,
            recommendedPages: ['home'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="85" height="100" rx="6" fill="currentColor"/><rect x="105" y="10" width="85" height="100" rx="6" fill="#F3F4F6"/><rect x="115" y="30" width="65" height="10" rx="3" fill="#D1D5DB"/><rect x="115" y="50" width="40" height="8" rx="3" fill="#E5E7EB"/></svg>`,
            isAvailable: true
        },
        {
            id: 'collections',
            title: 'Card / Masonry Grid',
            description: 'Dynamic shop category presentation in elegant grid or asymmetric masonry.',
            icon: FiGrid,
            recommendedPages: ['home'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="55" height="55" rx="6" fill="currentColor"/><rect x="72.5" y="10" width="55" height="55" rx="6" fill="#E5E7EB"/><rect x="135" y="10" width="55" height="55" rx="6" fill="#D1D5DB"/><rect x="10" y="75" width="55" height="35" rx="6" fill="#E5E7EB"/><rect x="72.5" y="75" width="55" height="35" rx="6" fill="#D1D5DB"/><rect x="135" y="75" width="55" height="35" rx="6" fill="currentColor"/></svg>`,
            isAvailable: true
        },
        {
            id: 'popular',
            title: 'Two Column Promos',
            description: 'Highlight new arrivals and best sellers side-by-side or stacked.',
            icon: FiLayout,
            recommendedPages: ['home'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="85" height="90" rx="6" fill="currentColor"/><rect x="105" y="10" width="85" height="90" rx="6" fill="currentColor"/><rect x="10" y="105" width="85" height="5" rx="2" fill="#D1D5DB"/><rect x="105" y="105" width="85" height="5" rx="2" fill="#D1D5DB"/></svg>`,
            isAvailable: true
        },
        {
            id: 'banner',
            title: 'Featured Image Banner',
            description: 'A wide, single-image promotional stripe to drive immediate user action.',
            icon: BsViewStacked,
            recommendedPages: ['home', 'product', 'shop'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="25" width="180" height="70" rx="6" fill="currentColor"/><rect x="30" y="55" width="80" height="10" rx="3" fill="#F3F4F6"/></svg>`,
            isAvailable: true
        },
        {
            id: 'journal',
            title: 'Journal / News',
            description: 'Share your latest stories, news, and updates in an elegant layout.',
            icon: FiBook,
            recommendedPages: ['home', 'product'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="55" height="40" rx="4" fill="currentColor"/><rect x="10" y="55" width="55" height="6" rx="2" fill="#9CA3AF"/><rect x="10" y="65" width="40" height="4" rx="2" fill="#D1D5DB"/><rect x="72.5" y="10" width="55" height="40" rx="4" fill="currentColor"/><rect x="72.5" y="55" width="55" height="6" rx="2" fill="#9CA3AF"/><rect x="72.5" y="65" width="40" height="4" rx="2" fill="#D1D5DB"/><rect x="135" y="10" width="55" height="40" rx="4" fill="currentColor"/><rect x="135" y="55" width="55" height="6" rx="2" fill="#9CA3AF"/><rect x="135" y="65" width="40" height="4" rx="2" fill="#D1D5DB"/></svg>`,
            isAvailable: true
        },
        {
            id: 'campaigns',
            title: 'Campaign Cards',
            description: 'Luxury promo cards with images and text for specific product sets or limited series.',
            icon: FiTag,
            recommendedPages: ['home'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="85" height="100" rx="10" fill="currentColor"/><rect x="105" y="10" width="85" height="100" rx="10" fill="currentColor"/><rect x="25" y="70" width="55" height="4" rx="2" fill="#FFFFFF" opacity="0.3"/><rect x="25" y="80" width="40" height="4" rx="2" fill="#FFFFFF" opacity="0.2"/><rect x="120" y="70" width="55" height="4" rx="2" fill="#FFFFFF" opacity="0.3"/><rect x="120" y="80" width="40" height="4" rx="2" fill="#FFFFFF" opacity="0.2"/></svg>`,
            isAvailable: true
        },
        {
            id: 'advantages',
            title: 'Advantage Area',
            description: 'Highlight your store\'s key benefits like free shipping and security.',
            icon: FiAward,
            recommendedPages: ['home', 'product', 'about'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><circle cx="50" cy="40" r="15" fill="currentColor"/><rect x="30" y="65" width="40" height="4" rx="2" fill="#D1D5DB"/><circle cx="100" cy="40" r="15" fill="currentColor"/><rect x="80" y="65" width="40" height="4" rx="2" fill="#D1D5DB"/><circle cx="150" cy="40" r="15" fill="currentColor"/><rect x="130" y="65" width="40" height="4" rx="2" fill="#D1D5DB"/></svg>`,
            isAvailable: true
        },
        {
            id: 'product_details',
            title: 'Product Base Info',
            description: 'The main product details, images gallery, and purchase section.',
            icon: FiTag,
            recommendedPages: ['product'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="85" height="100" rx="6" fill="#F3F4F6"/><rect x="105" y="10" width="60" height="15" rx="3" fill="currentColor"/><rect x="105" y="35" width="40" height="8" rx="2" fill="#D1D5DB"/><rect x="105" y="55" width="85" height="30" rx="4" fill="#E5E7EB"/><rect x="105" y="95" width="85" height="15" rx="4" fill="currentColor"/></svg>`,
            isAvailable: true
        },
        {
            id: 'related_products',
            title: 'Related Products',
            description: 'Showcases other products in the same category to drive cross-sales.',
            icon: FiGrid,
            recommendedPages: ['product'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="70" y="5" width="60" height="10" rx="3" fill="currentColor"/><rect x="10" y="25" width="40" height="60" rx="6" fill="#F3F4F6"/><rect x="55" y="25" width="40" height="60" rx="6" fill="#F3F4F6"/><rect x="100" y="25" width="40" height="60" rx="6" fill="#E5E7EB"/><rect x="145" y="25" width="40" height="60" rx="6" fill="#F3F4F6"/></svg>`,
            isAvailable: true
        },
        {
            id: 'about_hero',
            title: 'About Top Banner',
            description: 'Main hero text and background video for the Our Story page.',
            icon: FiImage,
            recommendedPages: ['about'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="10" width="180" height="100" rx="6" fill="currentColor"/><circle cx="100" cy="60" r="15" fill="#D1D5DB"/><path d="M95 52l12 8-12 8v-16z" fill="white"/></svg>`,
            isAvailable: true
        },
        {
            id: 'about_authenticity',
            title: 'Craftsmanship Section',
            description: 'Text and image layout highlighting the artisan process.',
            icon: FiSidebar,
            recommendedPages: ['about'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="20" width="80" height="80" rx="6" fill="#F3F4F6"/><rect x="20" y="40" width="50" height="8" rx="2" fill="#D1D5DB"/><rect x="20" y="60" width="60" height="4" rx="2" fill="#E5E7EB"/><rect x="20" y="70" width="40" height="4" rx="2" fill="#E5E7EB"/><rect x="110" y="10" width="80" height="100" rx="6" fill="currentColor"/></svg>`,
            isAvailable: true
        },
        {
            id: 'about_showcase',
            title: 'Video Showcase',
            description: 'Two column video/image showcase grid.',
            icon: FiColumns,
            recommendedPages: ['about'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><rect x="10" y="20" width="85" height="80" rx="4" fill="currentColor"/><circle cx="52.5" cy="60" r="10" fill="#D1D5DB"/><path d="M49 55l8 5-8 5v-10z" fill="white"/><rect x="105" y="20" width="85" height="80" rx="4" fill="currentColor"/></svg>`,
            isAvailable: true
        },
        {
            id: 'about_philosophy',
            title: 'Philosophy Quote',
            description: 'Bottom quote and branding block.',
            icon: FiBook,
            recommendedPages: ['about'],
            image: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-gray-200"><circle cx="100" cy="40" r="20" fill="currentColor"/><rect x="40" y="75" width="120" height="6" rx="3" fill="#D1D5DB"/><rect x="60" y="90" width="80" height="4" rx="2" fill="#E5E7EB"/></svg>`,
            isAvailable: true
        }
    ];

    const recommended = components.filter(c => c.recommendedPages.includes(pageType));
    const other = components.filter(c => !c.recommendedPages.includes(pageType));

    const renderCard = (comp: ComponentDefinition) => {
        const isAdded = activeIds.includes(comp.id);
        return (
            <div key={comp.id} className="group flex flex-col bg-background rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-40 bg-background border-b border-gray-50 flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-muted/50 transition-colors">
                    <div className="w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" dangerouslySetInnerHTML={{ __html: comp.image.replace(/currentColor/g, '#E2E8F0') }} />
                    {!comp.isAvailable && (
                        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Coming Soon</span>
                        </div>
                    )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <comp.icon size={16} className={isAdded ? "text-green-500" : "text-foreground"} />
                        <h3 className="font-bold text-sm text-foreground">{comp.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6 leading-relaxed flex-1">{comp.description}</p>
                    <div className="mt-auto">
                        {isAdded ? (
                            <button disabled className="w-full py-2.5 bg-green-50 text-green-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-green-200">
                                <FiCheck size={16} /> Already Installed
                            </button>
                        ) : (
                            <button
                                disabled={!comp.isAvailable}
                                onClick={() => onAdd(comp.id)}
                                className="w-full py-2.5 bg-foreground text-background font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-gray-800 hover:shadow-xl disabled:bg-gray-200 disabled:text-muted-foreground/80 disabled:shadow-none transition-all active:scale-95"
                            >
                                <FiPlus size={14} /> Add to Page
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-background rounded-[2rem] shadow-2xl w-full max-w-[1000px] h-[85vh] max-h-[900px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-background sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <span className="p-2 bg-foreground text-background rounded-xl shadow-lg ring-1 ring-black/5"><FiLayout size={20} /></span>
                            Component Store
                        </h2>
                        <p className="text-muted-foreground text-sm font-medium mt-1">Browse layouts for your current <span className="text-foreground font-bold uppercase underline underline-offset-4 decoration-[#C5A059]">{pageType}</span> page.</p>
                    </div>
                    <button onClick={onClose} className="p-3 text-muted-foreground/80 hover:bg-muted/80 hover:text-foreground rounded-full transition-all">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-muted/50 custom-scrollbar">
                    {recommended.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center gap-4 mb-6">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">Recommended for you</h3>
                                <div className="h-px flex-1 bg-gray-200"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommended.map(renderCard)}
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80">All Components</h3>
                            <div className="h-px flex-1 bg-gray-200"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {other.map(renderCard)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
