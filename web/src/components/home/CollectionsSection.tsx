'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Category } from '@/types/category';
import { useSearchParams } from 'next/navigation';

const fallbackImages: Record<string, string> = {
    'Bracelets': '/image/alceix/product.png',
    'Necklaces': '/image/alceix/product.png',
    'Rings': '/image/alceix/product.png',
    'Earrings': '/image/alceix/product.png',
    'default': '/image/alceix/hero.png'
};

import * as Sections from '@/types/sections';

const CategoryCardImage = ({ src, alt, fallbackSrc }: { src: string, alt: string, fallbackSrc: string }) => {
    const [hasError, setHasError] = useState(false);
    const [prevSrc, setPrevSrc] = useState(src);

    if (src !== prevSrc) {
        setPrevSrc(src);
        setHasError(false);
    }

    return (
        <Image
            src={hasError ? fallbackSrc : src}
            alt={alt}
            fill
            onError={() => {
                if (!hasError) setHasError(true);
            }}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
    );
};

export default function CollectionsSection({ instanceId, data: passedData }: { instanceId?: string, data?: Sections.CollectionsData }) {
    const searchParams = useSearchParams();
    const { categories, isLoading: loading, fetchPublicCategories } = useCategoryStore();
    const { homeSettings, globalSettings } = useContentStore();
    const { instances } = useCmsStore();
    const { t } = useTranslation();
 
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const instanceData = passedData || (instance?.data as Sections.CollectionsData);
    const layout = instanceData?.categoryLayout || homeSettings?.categoryLayout || 'carousel';
    const showGlassEffect = instanceData?.showGlassEffect || homeSettings?.showGlassEffect || false;

    useEffect(() => {
        const forceRefresh = searchParams?.get('refresh') === 'true';
        if (forceRefresh || categories.length === 0) {
            fetchPublicCategories(forceRefresh);
        }
    }, [searchParams, categories.length, fetchPublicCategories]);

    const renderCategory = (category: Category, index: number, currentLayout: string) => {
        const displayImage = category.image || fallbackImages[category.name] || fallbackImages.default;

        let widthClass = "w-[85%] sm:w-[45%] lg:w-[23.5%] flex-none snap-start";
        let aspectClass = "aspect-[3/4]";
        let titleClass = "text-4xl md:text-5xl";

        if (currentLayout === 'grid') {
            widthClass = "w-full";
            aspectClass = "aspect-[3/4]";
            titleClass = "text-2xl md:text-3xl";
        } else if (currentLayout === 'minimal') {
            widthClass = "w-full";
            aspectClass = "aspect-square";
            titleClass = "text-xl md:text-2xl";
        } else if (currentLayout === 'masonry' || currentLayout === 'editorial') {
            widthClass = "w-full h-full";
            aspectClass = ""; // Handled by masonry/editorial container
            titleClass = index === 0 ? "text-5xl md:text-7xl" : "text-3xl md:text-5xl";
            
            if (currentLayout === 'editorial') {
                titleClass = index % 2 === 0 ? "text-4xl md:text-6xl" : "text-3xl md:text-5xl";
            }
        }

        return (
            <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className={`relative overflow-hidden bg-background active:cursor-grabbing group ${widthClass} ${aspectClass}`}
            >
                <div className="absolute inset-0 z-0">
                    <CategoryCardImage
                        src={displayImage}
                        alt={category.name}
                        fallbackSrc={fallbackImages[category.name] || fallbackImages.default}
                    />
                </div>

                {/* Content Overlay */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-white p-6 z-20 transition-all duration-700 ${currentLayout !== 'minimal' ? 'bg-black/10 group-hover:bg-black/40' : ''}`}>
                    {/* Category Name */}
                    <h4 className={`${titleClass} font-light serif mb-4 tracking-tight text-center group-hover:scale-105 transition-transform duration-1000 drop-shadow-2xl`}>
                        {category.name}
                    </h4>

                    {/* View Collection - Now with optional intensive Liquid Glass effect */}
                    <div className="relative group/btn-container">
                        <Link
                            href={`/categories/${category.slug}`}
                            className={`
                                ${currentLayout === 'minimal' ? 'opacity-100' : 'opacity-0'} 
                                group-hover:opacity-100 flex items-center gap-2 
                                text-[11px] font-medium tracking-normal
                                translate-y-4 group-hover:translate-y-0 transition-all duration-700 
                                px-6 py-3 rounded-full border border-white/20 shadow-xl overflow-hidden
                                ${showGlassEffect 
                                    ? 'bg-white/15 backdrop-blur-2xl shadow-[0_8px_32px_rgba(255,255,255,0.1)]' 
                                    : 'bg-white/10 backdrop-blur-md'}
                            `}
                        >
                            {/* Animated Liquid Gradient inside the button */}
                            {showGlassEffect && (
                                <motion.div 
                                    className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/30 via-white/5 to-primary/30"
                                    animate={{ 
                                        x: ['-100%', '100%'],
                                    }}
                                    transition={{ 
                                        duration: 3, 
                                        repeat: Infinity, 
                                        ease: "linear" 
                                    }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {t('common.viewCollection')}
                                <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Internal Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-t from-primary/30 via-transparent to-transparent pointer-events-none z-15"></div>
            </motion.div>
        );
    };

    if (loading) return null;

    return (
        <section className={`w-full bg-background ${layout === 'editorial' ? 'py-40' : 'py-20'} overflow-hidden`}>
            <div className="max-w-[1700px] mx-auto px-6 md:px-12">
                {/* Header - Hide if editorial */}
                {layout !== 'editorial' && (
                    <div className="flex flex-col items-center mb-16 space-y-4">
                        <h3 className="text-[10px] md:text-sm tracking-[0.3em] font-normal text-foreground/50 uppercase text-center max-w-2xl px-4">
                            {globalSettings?.tagline || t('common.defaultTagline')}
                        </h3>
                        <div className="w-12 h-[1px] bg-foreground/20"></div>
                    </div>
                )}

                {/* Categories Container */}
                <div className="relative group/scroll">
                    {layout === 'carousel' ? (
                        <div className="flex gap-4 overflow-x-auto pb-8 pt-4 custom-scrollbar scroll-smooth snap-x snap-mandatory">
                            {categories.filter(cat => cat && cat._id).map((category, index) => renderCategory(category, index, 'carousel'))}
                        </div>
                    ) : layout === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                            {categories.filter(cat => cat && cat._id).map((category, index) => renderCategory(category, index, 'grid'))}
                        </div>
                    ) : layout === 'minimal' ? (
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                            {categories.filter(cat => cat && cat._id).map((category, index) => renderCategory(category, index, 'minimal'))}
                        </div>
                    ) : layout === 'editorial' ? (
                        /* New Editorial / Asymmetric Layout */
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 auto-rows-[300px] md:auto-rows-[400px]">
                            {categories.filter(cat => cat && cat._id).slice(0, 5).map((category, index) => {
                                const editorialClasses = [
                                    'md:col-span-7 md:row-span-2', // Massive featured
                                    'md:col-span-5 md:row-span-1', // Side top
                                    'md:col-span-5 md:row-span-1', // Side bottom
                                    'md:col-span-4 md:row-span-1', // Bottom left
                                    'md:col-span-8 md:row-span-1'  // Bottom right wide
                                ];
                                return (
                                    <div key={category._id} className={`${editorialClasses[index] || 'md:col-span-4'} relative`}>
                                        {renderCategory(category, index, 'editorial')}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Masonry / Asymmetric Layout */
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full min-h-[600px]">
                            {categories.filter(cat => cat && cat._id).slice(0, 4).map((category, index) => {
                                const masonryClasses = [
                                    'md:col-span-8 md:row-span-2 aspect-[16/9] md:aspect-auto', // Big one
                                    'md:col-span-4 md:row-span-1 aspect-[4/3] md:aspect-auto', // Side top
                                    'md:col-span-4 md:row-span-1 aspect-[4/3] md:aspect-auto', // Side bottom
                                    'md:col-span-12 md:row-span-1 aspect-[21/9] md:aspect-auto' // Bottom wide
                                ];
                                return (
                                    <div key={category._id} className={masonryClasses[index] || 'md:col-span-4'}>
                                        {renderCategory(category, index, 'masonry')}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {layout === 'carousel' && (
                        <style jsx>{`
                            /* Custom Scrollbar Styling */
                             .custom-scrollbar::-webkit-scrollbar {
                                height: 4px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: rgba(0,0,0,0.1);
                                borderRadius: 10px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: rgba(0,0,0,0.2);
                            }
                        `}</style>
                    )}
                </div>
            </div>
        </section>
    );
}
