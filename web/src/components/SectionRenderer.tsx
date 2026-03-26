'use client';

import React, { lazy, Suspense } from 'react';
import Link from 'next/link';

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

// About-specific components (Import directly for now if needed, or lazy)
// Since AboutPage uses motion, I'll keep the logic for now or move it to components
import { motion } from 'framer-motion';

interface SectionRendererProps {
    section: any;
    instances: any[];
    currentPage?: any;
    extraData?: any;
}

export default function SectionRenderer({ section, instances, currentPage, extraData }: SectionRendererProps) {
    const sectionId = typeof section === 'string' ? section : section.id;
    const isActive = typeof section === 'string' ? true : (section.isActive ?? true);
    if (!isActive) return null;

    const isInstance = sectionId.includes('_instance_');
    const type = isInstance ? sectionId.split('_instance_')[0] : sectionId;
    const instanceId = isInstance ? sectionId.split('_instance_')[1] : undefined;
    
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const data = instance?.data;

    console.log('SectionRenderer DEBUG:', { sectionId, type, isActive, hasInstance: !!instance });

    const renderContent = () => {
        switch (type) {
            case 'hero': return <HeroSection instanceId={instanceId} />;
            case 'featured': return <FeaturedCollection instanceId={instanceId} />;
            case 'collections': return <CollectionsSection instanceId={instanceId} />;
            case 'banner': return <HomeBanner instanceId={instanceId} />;
            case 'popular': return <PopularCollections instanceId={instanceId} />;
            case 'journal': return <HomeJournal instanceId={instanceId} />;
            case 'advantages': return <AdvantageSection instanceId={instanceId} data={data || currentPage?.advantageSection} />;
            case 'category_listing': return <CategoryListing instanceId={instanceId} data={data} extraData={extraData} />;
            case 'campaigns': return <CampaignSection instanceId={instanceId} data={data || currentPage?.campaignSection} />;
            case 'faq': return <FAQSection instanceId={instanceId} />;
            case 'explore_rooms': return <ExploreByRoomSection instanceId={instanceId} />;
            case 'about_us': return <AboutUsSection instanceId={instanceId} />;
            case 'custom_products': return <CustomProductsSection instanceId={instanceId} />;
            case 'legal_content': return <LegalContentSection instanceId={instanceId} data={data || extraData?.legalData} />;
            case 'page_hero':
            case 'contact_hero': return <PageHero data={data} instanceId={instanceId} />;
            case 'contact_form':
            case 'contact_split_form': return <ContactFormSection data={data} instanceId={instanceId} />;
            case 'contact_info':
            case 'contact_faq': return <ContactInfoSection data={data} instanceId={instanceId} />;
            case 'auth': return <AuthSection data={data || (currentPage?.slug === 'register' ? { type: 'register' } : { type: 'login' })} instanceId={instanceId} />;
            
            // About specifics (Inlined or moved to components soon)
            case 'about_hero': {
                const heroData = data || currentPage?.hero;
                if (!heroData?.isVisible) return null;
                const heroLayout = heroData.layout || 'fullscreen';

                if (heroLayout === 'split-visual') {
                    return (
                        <section className="w-full min-h-[80vh] flex flex-col md:flex-row bg-background overflow-hidden">
                            <div className="w-full md:w-1/2 h-[50vh] md:h-auto relative">
                                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                                    <source src={heroData.videoUrl} type="video/mp4" />
                                </video>
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-12 lg:p-24 text-center bg-foreground/5">
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="space-y-6">
                                    <span className="text-[10px] md:text-xs tracking-[0.5em] font-bold text-foreground/50 uppercase">{heroData.subtitle}</span>
                                    <h1 className="text-5xl md:text-7xl font-light serif text-foreground italic">{heroData.title}</h1>
                                    <div className="h-[1px] w-16 bg-foreground/20 mx-auto mt-8"></div>
                                </motion.div>
                            </div>
                        </section>
                    );
                }

                if (heroLayout === 'minimal-centered') {
                    return (
                        <section className="w-full py-32 bg-background flex flex-col items-center justify-center text-center px-6">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6 mb-16 max-w-3xl mx-auto">
                                <span className="text-[10px] tracking-[0.4em] font-bold text-foreground/50 uppercase">{heroData.subtitle}</span>
                                <h1 className="text-5xl md:text-7xl font-light serif text-foreground italic leading-tight">{heroData.title}</h1>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="w-full max-w-5xl aspect-video relative rounded-2xl overflow-hidden shadow-2xl">
                                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                    <source src={heroData.videoUrl} type="video/mp4" />
                                </video>
                            </motion.div>
                        </section>
                    );
                }

                return (
                    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-background">
                        <div className="absolute inset-0 z-0 opacity-60">
                            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                <source src={heroData.videoUrl} type="video/mp4" />
                            </video>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40 z-10" />
                        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center text-center text-foreground px-6">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} className="space-y-4">
                                <span className="text-[10px] md:text-xs tracking-[0.5em] font-light uppercase opacity-80">{heroData.subtitle}</span>
                                <h1 className="text-6xl md:text-9xl font-light serif tracking-tighter mb-4 italic">{heroData.title}</h1>
                                <div className="h-[1px] w-24 bg-foreground/30 mx-auto"></div>
                            </motion.div>
                        </div>
                    </section>
                );
            }
            case 'about_authenticity': {
                const authData = data || currentPage?.authenticity;
                if (!authData?.isVisible) return null;
                const authLayout = authData.layout || 'image-right';

                return (
                    <section className="w-full bg-background py-32 relative overflow-hidden">
                        <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                            {authLayout === 'stacked' ? (
                                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} viewport={{ once: true }} className="space-y-6 mb-16">
                                        <span className="text-[10px] tracking-[0.4em] font-bold text-foreground/50 uppercase">{authData.tagline}</span>
                                        <h2 className="text-4xl md:text-6xl font-light text-foreground serif leading-tight italic">
                                            {authData.titlePart1} <span className="text-foreground/50">{authData.titlePart2}</span>
                                        </h2>
                                        <p className="text-lg text-foreground/70 font-light leading-relaxed max-w-2xl mx-auto italic">{authData.description}</p>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} viewport={{ once: true }} className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl">
                                        <img src={authData.imageUrl} alt="Artisan process" className="w-full h-full object-cover" />
                                    </motion.div>
                                </div>
                            ) : (
                                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${authLayout === 'image-left' ? 'lg:flex-row-reverse' : ''}`}>
                                    <motion.div initial={{ opacity: 0, x: authLayout === 'image-left' ? 30 : -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} viewport={{ once: true }} className={`space-y-8 ${authLayout === 'image-left' ? 'lg:order-2' : ''}`}>
                                        <div className="space-y-4">
                                            <span className="text-[10px] tracking-[0.4em] font-bold text-foreground/50 uppercase">{authData.tagline}</span>
                                            <h2 className="text-4xl md:text-6xl font-light text-foreground serif leading-tight italic">{authData.titlePart1} <br /><span className="text-foreground/50">{authData.titlePart2}</span></h2>
                                        </div>
                                        <p className="text-lg text-foreground/70 font-light leading-relaxed max-w-md italic">{authData.description}</p>
                                    </motion.div>
                                    <div className={`relative group ${authLayout === 'image-left' ? 'lg:order-1' : ''}`}>
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} viewport={{ once: true }} className="aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl relative">
                                            <img src={authData.imageUrl} alt="Artisan process" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" />
                                        </motion.div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                );
            }
            case 'about_showcase': {
                const showData = data || currentPage?.showcase;
                if (!showData?.isVisible) return null;
                const showcaseLayout = showData.layout || 'grid-2-col';

                return (
                    <section className="w-full bg-background py-32">
                        <div className="max-w-[1440px] mx-auto px-6 lg:px-20 text-center mb-16">
                            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-foreground text-3xl md:text-5xl font-light serif italic mb-4">{showData.title}</motion.h2>
                            <p className="text-foreground/50 tracking-[0.2em] uppercase text-[10px]">{showData.subtitle}</p>
                        </div>
                        {showcaseLayout === 'masonry' ? (
                            <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                    <div className="md:col-span-8 aspect-video relative overflow-hidden group rounded-2xl bg-background/5">
                                        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                            <source src={showData.videoUrl} type="video/mp4" />
                                        </video>
                                    </div>
                                    <div className="md:col-span-4 aspect-[3/4] relative overflow-hidden group rounded-2xl transform md:translate-y-12 bg-background/5">
                                        <img src={showData.imageUrl} className="w-full h-full object-cover" alt="Showcase detail" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-background">
                                <div className="aspect-square md:aspect-video relative overflow-hidden group bg-background/5">
                                    <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000">
                                        <source src={showData.videoUrl} type="video/mp4" />
                                    </video>
                                </div>
                                <div className="aspect-square md:aspect-video relative overflow-hidden group bg-background/5">
                                    <img src={showData.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" alt="Collection showcase" />
                                </div>
                            </div>
                        )}
                    </section>
                );
            }
            case 'about_philosophy': {
                const philData = data || currentPage?.philosophy;
                if (!philData?.isVisible) return null;

                return (
                    <section className="py-32 bg-background relative overflow-hidden">
                        <div className="max-w-4xl mx-auto px-6 text-center">
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
                                <div className="w-24 h-[1px] bg-foreground/10 mx-auto mb-12"></div>
                                <img src={philData.imageUrl} className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto object-cover mb-12 shadow-xl border-4 border-background" alt="Process detail" />
                                <blockquote className="text-2xl md:text-5xl font-serif font-light text-foreground mb-10 leading-[1.3] italic whitespace-pre-wrap">{philData.quote}</blockquote>
                                <div className="text-[10px] font-bold tracking-[0.4em] text-foreground/50 uppercase">{philData.tagline}</div>
                            </motion.div>
                        </div>
                    </section>
                );
            }
            
            case 'product_details': {
                if (!extraData?.product) return null;
                return (
                    <ProductBaseInfo
                        product={extraData.product}
                        theme={extraData.theme}
                        layout={extraData.layout}
                        isFavorite={extraData.isFavorite}
                        onToggleFavorite={extraData.onToggleFavorite}
                        onAddToCart={extraData.onAddToCart}
                        onShare={extraData.onShare}
                    />
                );
            }
            case 'related_products': {
                if (!extraData?.relatedProducts || extraData.relatedProducts.length === 0) return null;
                const relSettings = extraData.productSettings?.relatedProductsLayout || {
                    title: 'You May Also Like',
                    displayType: 'grid',
                    itemsCount: 4
                };
                const displayItems = extraData.relatedProducts.slice(0, relSettings.itemsCount || 4);

                return (
                    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 mb-32">
                        <div className="mt-16 pt-16 lg:mt-32 lg:pt-32 border-t border-foreground/10">
                            <div className="flex flex-col items-center text-center mb-16">
                                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-foreground/40 block mb-4">Recommendations</span>
                                <h2 className="text-3xl md:text-5xl font-serif text-foreground">{relSettings.title}</h2>
                            </div>
                            
                            {relSettings.displayType === 'slider' ? (
                                <div className="flex gap-8 overflow-x-auto pb-8 snap-x custom-scrollbar -mx-4 px-4 md:-mx-0 md:px-0">
                                    {displayItems.map((rp: any) => (
                                        <div key={rp._id} className="w-72 shrink-0 snap-start">
                                            <ProductCard product={rp} onAddToCart={extraData.onAddToCartFromCard} />
                                        </div>
                                    ))}
                                </div>
                            ) : relSettings.displayType === 'minimal' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {displayItems.map((rp: any) => (
                                        <Link href={`/products/${rp._id}`} key={rp._id} className="flex gap-4 p-4 border border-foreground/10 rounded-xl hover:shadow-md transition-shadow bg-background">
                                            <div className="w-24 h-24 shrink-0 bg-foreground/5 rounded-lg overflow-hidden">
                                                <img src={rp.mainImage || rp.image} alt={rp.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h4 className="font-bold text-sm text-foreground mb-1">{rp.name}</h4>
                                                <p className="text-xs text-primary font-medium">$ {(rp.discountedPrice ?? rp.price).toLocaleString()}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                                    {displayItems.map((rp: any) => (
                                        <ProductCard key={rp._id} product={rp} onAddToCart={extraData.onAddToCartFromCard} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            
            default: return null;
        }
    };

    return (
        <Suspense fallback={<div className="h-48 flex items-center justify-center bg-foreground/5 animate-pulse rounded-lg"></div>}>
            {renderContent()}
        </Suspense>
    );
}
