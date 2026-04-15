'use client';

import React, { lazy, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector } from '@/lib/hooks';
import { getCurrencySymbol } from '@/utils/currency';
import { useTranslation } from '@/hooks/useTranslation';
import type { ComponentInstance } from '@/types/component';
import type { CustomPage } from '@/types/page';
import type { Product } from '@/types/product';
import type { GlobalSettings, ProductSettings } from '@/types/content';
import * as Sections from '@/types/sections';

// Lazy load all components
const HeroSection = lazy(() => import('@/components/home/HeroSection'));
const FeaturedCollection = lazy(() => import('@/components/home/FeaturedCollection'));
const CollectionsSection = lazy(() => import('@/components/home/CollectionsSection'));
const HomeBanner = lazy(() => import('@/components/home/HomeBanner'));
const PopularCollections = lazy(() => import('@/components/home/PopularCollections'));
const HomeJournal = lazy(() => import('@/components/home/HomeJournal'));
const AdvantageSection = lazy(() => import('@/components/home/AdvantageSection'));
const CampaignSection = lazy(() => import('@/components/home/CampaignSection'));
const FAQSection = lazy(() => import('@/components/home/FAQSection'));
const ExploreByRoomSection = lazy(() => import('@/components/home/ExploreByRoomSection'));
const AboutUsSection = lazy(() => import('@/components/home/AboutUsSection'));
const CustomProductsSection = lazy(() => import('@/components/home/CustomProductsSection'));
const LegalContentSection = lazy(() => import('@/components/home/LegalContentSection'));
const PageHero = lazy(() => import('@/components/home/PageHero'));
const ContactFormSection = lazy(() => import('@/components/home/ContactFormSection'));
const ContactInfoSection = lazy(() => import('@/components/home/ContactInfoSection'));
const AuthSection = lazy(() => import('@/components/auth/AuthSection'));
const ProductBaseInfo = lazy(() => import('@/components/product/ProductBaseInfo'));
const ProductCard = lazy(() => import('@/components/ProductCard'));
const CategoryListing = lazy(() => import('@/components/category/CategoryListing'));
const AboutHero = lazy(() => import('@/components/home/AboutHero'));
const AboutAuthenticity = lazy(() => import('@/components/home/AboutAuthenticity'));
const AboutShowcase = lazy(() => import('@/components/home/AboutShowcase'));
const AboutPhilosophy = lazy(() => import('@/components/home/AboutPhilosophy'));
const BlogListSection = lazy(() => import('@/components/blog/BlogListSection'));
const BlogDetailSection = lazy(() => import('@/components/blog/BlogDetailSection'));

// About-specific components handled via lazy loading

interface SectionRendererProps {
    section: string | { id: string; isActive?: boolean; instanceData?: Sections.SectionData };
    instances: ComponentInstance[];
    currentPage?: CustomPage | null;
    extraData?: {
        legalData?: Sections.LegalData;
        product?: Product;
        theme?: NonNullable<GlobalSettings['theme']>;
        layout?: NonNullable<ProductSettings['layout']>;
        isFavorite?: boolean;
        onToggleFavorite?: () => void;
        onAddToCart?: (quantity: number) => void;
        onShare?: () => void;
        relatedProducts?: Product[];
        productSettings?: ProductSettings;
        onAddToCartFromCard?: (product: Product) => void;
        slug?: string;
    };
}

export default function SectionRenderer({ section, instances, currentPage, extraData }: SectionRendererProps) {
    const { globalSettings } = useAppSelector((state) => state.content);
    const { t } = useTranslation();
    const currencySymbol = getCurrencySymbol(globalSettings?.currency);
    const sectionId = typeof section === 'string' ? section : section.id;
    const isActive = typeof section === 'string' ? true : (section.isActive ?? true);
    if (!isActive) return null;

    const isInstance = sectionId.includes('_instance_');
    const type = isInstance ? sectionId.split('_instance_')[0] : sectionId;
    const instanceId = isInstance ? sectionId.split('_instance_')[1] : undefined;

    // PRIORITY 1: Populated data from the backend (Targeted Loading)
    // PRIORITY 2: Global instances lookup (Backward Compatibility / Admin Preview)
    const instance =
        typeof section !== 'string' && section.instanceData
            ? { data: section.instanceData }
            : (instanceId ? instances.find((i) => i._id === instanceId) : null);
    const data = instance?.data;


    const renderContent = () => {
        switch (type) {
            case 'hero': return <HeroSection instanceId={instanceId} data={data as Sections.HeroData} />;
            case 'featured': return <FeaturedCollection instanceId={instanceId} data={data as Sections.FeaturedData} />;
            case 'collections': return <CollectionsSection instanceId={instanceId} data={data as Sections.CollectionsData} />;
            case 'banner': return <HomeBanner instanceId={instanceId} data={data as Sections.HomeBannerData} />;
            case 'popular': return <PopularCollections instanceId={instanceId} data={data as Sections.PopularCollectionsData} />;
            case 'journal': return <HomeJournal instanceId={instanceId} data={data as Sections.HomeJournalData} />;
            case 'advantages': return <AdvantageSection instanceId={instanceId} data={(data || currentPage?.['advantageSection']) as Sections.AdvantageData} />;
            case 'category_listing': return <CategoryListing instanceId={instanceId} data={data as Sections.CategoryListingData} extraData={extraData} />;
            case 'campaigns': return <CampaignSection instanceId={instanceId} data={(data || currentPage?.['campaignSection']) as Sections.CampaignData} />;
            case 'faq': return <FAQSection instanceId={instanceId} data={data as Sections.FAQData} />;
            case 'explore_rooms': return <ExploreByRoomSection instanceId={instanceId} data={data as Sections.ExploreByRoomData} />;
            case 'about_us': return <AboutUsSection instanceId={instanceId} data={data as Sections.AboutUsData} />;
            case 'custom_products': return <CustomProductsSection instanceId={instanceId} data={data as Sections.CustomProductsData} />;
            case 'legal_content': return <LegalContentSection instanceId={instanceId} data={(data || extraData?.legalData) as Sections.LegalData} />;
            case 'page_hero':
            case 'contact_hero': {
                const heroData = data as Sections.HeroData;
                return (
                    <PageHero
                        data={{
                            title: heroData?.heroTitle || (data as Sections.PageHeroData)?.title || '',
                            subtitle: heroData?.heroDescription || (data as Sections.PageHeroData)?.subtitle || '',
                            backgroundImageUrl: heroData?.heroImageUrl || (data as Sections.PageHeroData)?.backgroundImageUrl || '',
                            variant: (heroData?.heroLayout as Sections.PageHeroData['variant']) || (data as Sections.PageHeroData)?.variant || 'classic'
                        }}
                        instanceId={instanceId}
                    />
                );
            }
            case 'contact_form':
            case 'contact_split_form': return <ContactFormSection data={data as Sections.ContactFormData} instanceId={instanceId} />;
            case 'contact_info':
            case 'contact_faq': return <ContactInfoSection data={data as Sections.ContactInfoData} instanceId={instanceId} />;
            case 'auth': return <AuthSection data={(data || (currentPage?.slug === 'register' ? { type: 'register' } : { type: 'login' })) as Sections.AuthData} instanceId={instanceId} />;

            // About specifics (Inlined or moved to components soon)
            case 'about_hero': {
                const aboutData = data as Sections.AboutUsData;
                return (
                    <AboutHero
                        data={{
                            isVisible: aboutData?.isVisible ?? true,
                            title: aboutData?.title || aboutData?.heroTitle || '',
                            subtitle: aboutData?.subtitle || aboutData?.heroSubtitle || '',
                            videoUrl: aboutData?.videoUrl || aboutData?.heroVideoUrl || '',
                            layout: aboutData?.layout || aboutData?.heroLayout || 'fullscreen'
                        }}
                        currentPage={currentPage}
                    />
                );
            }
            case 'about_authenticity': {
                const aboutData = data as Sections.AboutUsData;
                return (
                    <AboutAuthenticity
                        data={{
                            isVisible: aboutData?.isVisible ?? true,
                            tagline: aboutData?.tagline || aboutData?.authenticityTagline || '',
                            titlePart1: aboutData?.titlePart1 || aboutData?.authenticityTitlePart1 || '',
                            titlePart2: aboutData?.titlePart2 || aboutData?.authenticityTitlePart2 || '',
                            description: aboutData?.description || aboutData?.authenticityDescription || '',
                            imageUrl: aboutData?.imageUrl || aboutData?.authenticityImageUrl || '',
                            buttonText: aboutData?.buttonText || aboutData?.authenticityButtonText || '',
                            layout: aboutData?.layout || aboutData?.authenticityLayout || 'image-right'
                        }}
                        currentPage={currentPage || undefined}
                    />
                );
            }
            case 'about_showcase': return <AboutShowcase data={data as Sections.ShowcaseData} currentPage={currentPage || undefined} />;
            case 'about_philosophy': return <AboutPhilosophy data={data as Sections.PhilosophyData} currentPage={currentPage || undefined} />;

            case 'product_details': {
                if (!extraData?.product) return null;
                return (
                    <ProductBaseInfo
                        product={extraData.product}
                        theme={extraData.theme!}
                        layout={extraData.layout!}
                        isFavorite={extraData.isFavorite as boolean}
                        onToggleFavorite={extraData.onToggleFavorite as () => void}
                        onAddToCart={extraData.onAddToCart as (qty: number) => void}
                        onShare={extraData.onShare as () => void}
                    />
                );
            }
            case 'related_products': {
                if (!extraData?.relatedProducts || extraData.relatedProducts.length === 0) return null;
                const relSettings = extraData.productSettings?.relatedProductsLayout || {
                    title: t('product.recommendations.title'),
                    displayType: 'grid',
                    itemsCount: 4
                };
                const displayItems = extraData.relatedProducts.slice(0, relSettings.itemsCount || 4);

                return (
                    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 mb-32">
                        <div className="mt-16 pt-16 lg:mt-32 lg:pt-32 border-t border-foreground/10">
                            <div className="flex flex-col items-center text-center mb-16">
                                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-foreground/40 block mb-4">{t('product.recommendations.subtitle')}</span>
                                <h2 className="text-3xl md:text-5xl font-serif text-foreground">{relSettings.title}</h2>
                            </div>

                            {relSettings.displayType === 'slider' ? (
                                <div className="flex gap-8 overflow-x-auto pb-8 snap-x custom-scrollbar -mx-4 px-4 md:-mx-0 md:px-0">
                                    {displayItems.map((rp) => (
                                        <div key={rp._id} className="w-72 shrink-0 snap-start">
                                            <ProductCard product={rp} onAddToCart={extraData.onAddToCartFromCard as (p: Product) => void} />
                                        </div>
                                    ))}
                                </div>
                            ) : relSettings.displayType === 'minimal' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {displayItems.map((rp) => (
                                        <Link href={`/products/${rp._id}`} key={rp._id} className="flex gap-4 p-4 border border-foreground/10 rounded-xl hover:shadow-md transition-shadow bg-background">
                                            <div className="w-24 h-24 shrink-0 bg-foreground/5 rounded-lg overflow-hidden">
                                                <Image 
                                                  src={rp.mainImage || rp.image} 
                                                  alt={rp.name} 
                                                  width={96}
                                                  height={96}
                                                  className="object-cover" 
                                                />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h4 className="font-bold text-sm text-foreground mb-1">{rp.name}</h4>
                                                <p className="text-xs text-primary font-medium">{currencySymbol} {(rp.discountedPrice ?? rp.price).toLocaleString()}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                                    {displayItems.map((rp) => (
                                        <ProductCard key={rp._id} product={rp} onAddToCart={extraData.onAddToCartFromCard as (p: Product) => void} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }

            case 'blog_list': return <BlogListSection data={data as Sections.BlogListData} />;
            case 'blog_detail': return <BlogDetailSection data={data as Sections.BlogDetailData} instanceId={instanceId} extraData={{ slug: extraData?.slug as string }} />;

            default: return null;
        }
    };

    return (
        <Suspense fallback={<div className="h-48 flex items-center justify-center bg-foreground/5 animate-pulse rounded-lg"></div>}>
            {renderContent()}
        </Suspense>
    );
}
