'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPopularCollectionsContent } from '@/lib/slices/contentSlice';
import { fetchProductStats } from '@/lib/slices/productSlice';
import { useTranslation } from '@/hooks/useTranslation';

import * as Sections from '@/types/sections';

const PopularCollectionImage = ({ src, alt, fallbackSrc }: { src: string, alt: string, fallbackSrc: string }) => {
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
            className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
    );
};

export default function PopularCollections({ instanceId, data: passedData }: { instanceId?: string, data?: Sections.PopularCollectionsData }) {
    const dispatch = useAppDispatch();
    const { popularCollections: content, hasFetchedPopularCollections, loading: contentLoadingState, homeSettings } = useAppSelector((state) => state.content);
    const contentLoading = contentLoadingState.popularCollections;
    const { stats } = useAppSelector((state) => state.product);
    const statsLoading = false;
    const { instances } = useAppSelector((state) => state.component);
    const { t } = useTranslation();

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const instanceData = passedData || (instance?.data as Sections.PopularCollectionsData);

    const isLoading = contentLoading || statsLoading;

    useEffect(() => {
        const isPreview = typeof window !== 'undefined' && window.location.search.includes('preview=true');
        if (
            isPreview ||
            !hasFetchedPopularCollections
        ) {
            dispatch(fetchPopularCollectionsContent(isPreview));
        }
        if (stats.newArrivals === 0 && stats.bestSellers === 0) {
            dispatch(fetchProductStats());
        }
    }, [dispatch, hasFetchedPopularCollections, stats.newArrivals, stats.bestSellers]);

    const displayContent = instanceId ? instanceData : content;

    if (isLoading || (!displayContent?.newArrivals && !displayContent?.bestSellers)) {
        return null;
    }

    const layout = instanceData?.popularLayout || homeSettings?.popularLayout || 'grid';

    const collections = [
        {
            id: 'new-arrivals',
            title: displayContent?.newArrivalsTitle || t('common.newArrivals'),
            image: displayContent?.newArrivals,
            fallbackImage: '/image/alceix/product.png',
            link: displayContent?.newArrivalsLink || '/products?tag=new-arrival',
            count: stats.newArrivals,
            delay: 0
        },
        {
            id: 'best-sellers',
            title: displayContent?.bestSellersTitle || t('common.bestSellers'),
            image: displayContent?.bestSellers,
            fallbackImage: '/image/alceix/hero.png',
            link: displayContent?.bestSellersLink || '/products?tag=best-seller',
            count: stats.bestSellers,
            delay: 0.2
        }
    ];

    const renderItems = () => {
        const gridClass = layout === 'stacked' ? 'grid-cols-1' : (layout === 'split' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-12' : 'grid-cols-1 md:grid-cols-2');

        return (
            <div className={`grid ${gridClass} gap-8 w-full max-w-[1600px] mx-auto px-4 md:px-12`}>
                {collections.map((item, idx) => {
                    if (!item.image) return null;

                    const aspectClass = layout === 'split' ? (idx === 0 ? 'lg:col-span-8 aspect-[16/9]' : 'lg:col-span-4 aspect-[4/5]') : (layout === 'stacked' ? 'aspect-[21/9]' : 'aspect-square md:aspect-[16/9]');

                    return (
                        <Link
                            key={item.id}
                            href={item.link}
                            className={`block group relative overflow-hidden rounded-2xl ${aspectClass}`}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: item.delay }}
                                className="w-full h-full"
                            >
                                <PopularCollectionImage
                                    src={item.image}
                                    alt={item.title}
                                    fallbackSrc={item.fallbackImage}
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                    <div className="absolute top-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-4 group-hover:translate-y-0 text-white text-[10px] tracking-[0.3em] uppercase font-bold">
                                        {item.count} {t('common.products')}
                                    </div>
                                    <h3 className="text-3xl md:text-5xl text-white font-light serif italic tracking-wide drop-shadow-lg z-10 transition-transform duration-500 group-hover:-translate-y-2">
                                        {item.title}
                                    </h3>
                                    <div className="absolute bottom-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 text-white text-[10px] tracking-[0.4em] uppercase font-bold">
                                        {t('common.discover')} {item.title}
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        );
    };

    return (
        <section className="py-24 bg-background overflow-hidden w-full">
            <div className="w-full text-center mb-20 space-y-6">
                <h2 className="text-4xl md:text-6xl font-light serif text-foreground tracking-tight italic">
                    {t('common.popularCollections')}
                </h2>
                <div className="w-24 h-[1px] bg-primary/30 mx-auto"></div>
            </div>
            {renderItems()}
        </section>
    );
}
