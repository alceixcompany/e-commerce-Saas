'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/lib/hooks';
import { useTranslation } from '@/hooks/useTranslation';

import { CategoryListingData } from '@/types/sections';

interface CategoryListingProps {
    instanceId?: string;
    data?: CategoryListingData;
    extraData?: unknown;
}

export default function CategoryListing({ instanceId, data: passedData }: CategoryListingProps) {
    const { categories, loading: categoryLoading } = useAppSelector((state) => state.category);
    const isLoading = categoryLoading.fetchPublic;
    const { instances } = useAppSelector((state) => state.component);
    const { t } = useTranslation();


    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const data = (passedData || (instance?.data as CategoryListingData) || {
        title: t('categories.title'),
        subtitle: t('categories.subtitle'),
        layout: 'grid',
        columns: 3,
        showItemCount: true,
        imageAspectRatio: 'portrait'
    }) as CategoryListingData;

    if (isLoading) {
        return (
            <div className="py-20 flex justify-center">
                <div className="w-10 h-10 border-2 border-foreground/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const renderGrid = () => {
        const gridColsByColumns: Record<2 | 3 | 4, string> = {
            2: 'md:grid-cols-2',
            3: 'md:grid-cols-2 lg:grid-cols-3',
            4: 'md:grid-cols-2 lg:grid-cols-4',
        };
        const gridCols = gridColsByColumns[(data.columns as 2 | 3 | 4) ?? 3];
        const aspectClassByRatio: Record<'square' | 'portrait', string> = {
            square: 'aspect-square',
            portrait: 'aspect-[3/4]',
        };
        const aspectClass = aspectClassByRatio[(data.imageAspectRatio as 'square' | 'portrait') ?? 'portrait'];

        return (
            <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
                {categories.map((category, idx) => {
                    const count = category.productCount || 0;

                    return (
                        <motion.div
                            key={category._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                href={`/categories/${category.slug}`}
                                className="group block relative overflow-hidden bg-foreground/5"
                            >
                                <div className={`relative ${aspectClass} overflow-hidden`}>
                                    {category.image ? (
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-20">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                                    
                                    {data.showItemCount && (
                                        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-foreground">
                                            {t('categories.pieces', { count })}
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-lg font-light tracking-[0.2em] uppercase text-foreground group-hover:text-primary transition-colors">
                                        {category.name}
                                    </h3>
                                    <div className="mt-2 h-[1px] w-8 bg-primary/30 mx-auto transition-all group-hover:w-16" />
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    const renderMasonry = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20 lg:gap-x-20 lg:gap-y-32 max-w-6xl mx-auto">
            {categories.map((category, idx) => {
                const count = category.productCount || 0;

                return (
                    <motion.div
                        key={category._id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.15, duration: 0.8 }}
                        className="group relative"
                    >
                        <Link href={`/categories/${category.slug}`} className="block relative overflow-hidden rounded-[2rem] bg-muted/50 shadow-2xl transition-all duration-700 hover:shadow-primary/5">
                            <div className={`relative aspect-[3/4] overflow-hidden`}>
                                {category.image ? (
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-20">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
                            </div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                                <div className="overflow-hidden text-left">
                                    <motion.p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-70 mb-2 transform transition-transform duration-700 translate-y-4 group-hover:translate-y-0 text-white">
                                        {data.showItemCount ? t('categories.pieces', { count }) : t('categories.collection')}
                                    </motion.p>
                                </div>
                                <h3 className="text-3xl md:text-5xl font-light tracking-tight text-white text-left">{category.name}</h3>
                                <div className="h-[1px] w-0 bg-white/40 mt-6 group-hover:w-full transition-all duration-700 delay-100" />
                            </div>
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );

    const renderMinimal = () => (
        <div className="flex flex-col divide-y divide-foreground/10">
            {categories.map((category) => (
                <Link
                    key={category._id}
                    href={`/categories/${category.slug}`}
                    className="group py-8 flex items-center justify-between hover:px-4 transition-all"
                >
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold tracking-widest text-primary/40 uppercase">
                            /{category.slug}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-light tracking-wide text-foreground group-hover:text-primary transition-colors serif">
                            {category.name}
                        </h3>
                    </div>
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-foreground/40">{t('categories.shop')}</span>
                        <div className="w-8 h-[1px] bg-primary" />
                    </div>
                </Link>
            ))}
        </div>
    );

    const renderSlider = () => (
        <div className="flex gap-8 overflow-x-auto pb-8 snap-x custom-scrollbar -mx-6 px-6 cursor-grab active:cursor-grabbing">
            {categories.map((category) => (
                <Link
                    key={category._id}
                    href={`/categories/${category.slug}`}
                    className="relative shrink-0 w-[400px] aspect-[4/5] snap-start group overflow-hidden"
                >
                    <Image
                        src={category.image || '/image/alceix/product.png'}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-10 left-10 text-white">
                        <h3 className="text-3xl font-light tracking-widest uppercase mb-2">
                            {category.name}
                        </h3>
                        <p className="text-[10px] tracking-[0.3em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                            {t('categories.view')}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );

    return (
        <section className="py-24 bg-background">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                {(data.title || data.subtitle) && (
                    <div className="text-center mb-16">
                        {data.subtitle && (
                            <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase block mb-4">
                                {data.subtitle as React.ReactNode}
                            </span>
                        )}
                        {data.title && (
                            <h2 className="text-3xl md:text-5xl font-light text-foreground serif tracking-tighter">
                                {data.title as React.ReactNode}
                            </h2>
                        )}
                    </div>
                )}
                
                {categories.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-foreground/10 rounded-2xl bg-foreground/5 animate-in fade-in duration-700">
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.3em]">{t('categories.empty')}</p>
                        <p className="text-[10px] text-foreground/30 mt-2 italic tracking-wider">{t('categories.emptyDesc')}</p>
                    </div>
                ) : (
                    <>
                        {data.layout === 'minimal' ? renderMinimal() : 
                         data.layout === 'slider' ? renderSlider() : 
                         data.layout === 'masonry' ? renderMasonry() : 
                         renderGrid()}
                    </>
                )}
            </div>
        </section>
    );
}
