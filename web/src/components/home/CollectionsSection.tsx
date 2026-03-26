'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';
import { useTranslation } from '@/hooks/useTranslation';

import { useSearchParams } from 'next/navigation';

interface Category {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    productCount?: number;
}

const fallbackImages: Record<string, string> = {
    'Bracelets': '/image/alceix/product.png',
    'Necklaces': '/image/alceix/product.png',
    'Rings': '/image/alceix/product.png',
    'Earrings': '/image/alceix/product.png',
    'default': '/image/alceix/hero.png'
};

export default function CollectionsSection({ instanceId }: { instanceId?: string }) {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const { categories, isLoading: loading } = useAppSelector((state) => state.category);
    const { homeSettings, globalSettings } = useAppSelector((state) => state.content);
    const { instances } = useAppSelector((state) => state.component);
    const { t } = useTranslation();

    const instanceData = instanceId ? instances.find(i => i._id === instanceId)?.data : null;
    const layout = instanceData?.categoryLayout || homeSettings?.categoryLayout || 'carousel';

    useEffect(() => {
        const forceRefresh = searchParams?.get('refresh') === 'true';
        dispatch(fetchPublicCategories(forceRefresh));
    }, [dispatch, searchParams]);

    const renderCategory = (category: Category, index: number, currentLayout: string) => {
        const displayImage = category.image || fallbackImages[category.name] || fallbackImages.default;

        let widthClass = "w-[85%] sm:w-[45%] lg:w-[23.5%] flex-none snap-start";
        let aspectClass = "aspect-[3/4]";
        let titleClass = "text-4xl md:text-5xl";

        if (currentLayout === 'grid') {
            widthClass = "w-full";
            aspectClass = "aspect-[4/5]";
            titleClass = "text-3xl md:text-4xl";
        } else if (currentLayout === 'minimal') {
            widthClass = "w-full";
            aspectClass = "aspect-square";
            titleClass = "text-xl md:text-2xl";
        } else if (currentLayout === 'masonry') {
            widthClass = "w-full h-full";
            aspectClass = ""; // Handled by masonry container
            titleClass = index === 0 ? "text-5xl md:text-7xl" : "text-3xl md:text-4xl";
        }

        return (
            <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative overflow-hidden bg-background active:cursor-grabbing group ${widthClass} ${aspectClass}`}
            >
                <img
                    src={displayImage}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/30 transition-all duration-500"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                    {/* Product Count (Top) - Hide in minimal */}
                    {currentLayout !== 'minimal' && (
                        <span className="text-[10px] md:text-xs tracking-[0.2em] font-normal uppercase mb-auto pt-4 opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-700">
                            {category.productCount} {t('common.products').toUpperCase()}
                        </span>
                    )}

                    {/* Category Name (Center) */}
                    <h4 className={`${titleClass} font-light serif mb-4 tracking-wide text-center group-hover:scale-105 transition-transform duration-700 drop-shadow-lg`}>
                        {category.name}
                    </h4>

                    {/* View Collection (Bottom) - Hide in minimal default */}
                    <Link
                        href={`/categories/${category.slug}`}
                        className={`${currentLayout === 'minimal' ? 'opacity-100' : 'mt-auto pb-4 opacity-0'} group-hover:opacity-100 flex items-center gap-2 text-[10px] md:text-xs tracking-[0.2em] uppercase font-normal translate-y-4 group-hover:translate-y-0 transition-all duration-700`}
                    >
                        {t('common.viewCollection')}
                        <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Internal Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-t from-primary/40 via-transparent to-transparent pointer-events-none"></div>
            </motion.div>
        );
    };

    if (loading) return null;

    return (
        <section className="w-full bg-background py-20 overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col items-center mb-16 space-y-4">
                    <h3 className="text-[10px] md:text-sm tracking-[0.3em] font-normal text-foreground/50 uppercase text-center max-w-2xl px-4">
                        {globalSettings.tagline || t('common.defaultTagline')}
                    </h3>
                    <div className="w-12 h-[1px] bg-foreground/20"></div>
                </div>

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
                            .custom-scrollbar::-webkit-scrollbar { ... }
                        `}</style>
                    )}
                </div>
            </div>
        </section>
    );
}
