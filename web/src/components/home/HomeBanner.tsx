'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBanners } from '@/lib/slices/contentSlice';
import { useTranslation } from '@/hooks/useTranslation';
import { Banner } from '@/types/content';

import * as Sections from '@/types/sections';

export default function HomeBanner({ instanceId, data: passedData }: { instanceId?: string, data?: Sections.HomeBannerData }) {
    const dispatch = useAppDispatch();
    const { banners, hasFetchedBanners, loading: contentLoading, homeSettings } = useAppSelector((state) => state.content);
    const isLoading = contentLoading.banners;
    const { instances } = useAppSelector((state) => state.component);
    const { t } = useTranslation();
 
    useEffect(() => {
        const isPreview = typeof window !== 'undefined' && window.location.search.includes('preview=true');
        if (isPreview || (!hasFetchedBanners && banners.length === 0)) {
            dispatch(fetchBanners(isPreview));
        }
    }, [dispatch, banners.length, hasFetchedBanners]);
 
    if (isLoading) return null;
 
    // Determine layout
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const instanceData = passedData || (instance?.data as Sections.HomeBannerData);
    const layout = instanceData?.bannerLayout || homeSettings?.bannerLayout || 'classic';
    
    // Filter banners based on instance or default grid section
    const targetSection = instanceId ? `instance_${instanceId}` : 'grid';
    const activeGridBanners = banners
        .filter(b => b && b._id && b.section === targetSection && b.status === 'active')
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (activeGridBanners.length === 0) return null;

    const renderBanner = (banner: Banner, index: number) => {
        const isEven = index % 2 === 0;

        if (layout === 'split') {
            return (
                <div key={banner._id} className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} w-full min-h-[500px] border-b border-border last:border-0`}>
                    <div className="w-full md:w-1/2 h-[350px] md:h-auto relative overflow-hidden group">
                        <Image
                            src={banner.image}
                            alt={banner.title}
                            fill
                            className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                        />
                    </div>
                    <div className="w-full md:w-1/2 flex items-center justify-center p-12 lg:p-24 bg-muted/20">
                        <motion.div
                            initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className={`max-w-md ${isEven ? 'text-left' : 'text-right flex flex-col items-end'}`}
                        >
                            <h3 className="text-[10px] md:text-xs tracking-[0.4em] font-bold uppercase mb-4 text-primary/80">
                                {banner.description}
                            </h3>
                            <h2 className="text-4xl md:text-5xl font-light serif mb-8 leading-tight text-foreground">
                                {banner.title}
                            </h2>
                            <Link
                                href={banner.buttonUrl || '/collections'}
                                className="inline-flex items-center gap-3 bg-foreground text-background px-10 py-4 text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95"
                            >
                                {banner.buttonText || t('common.discover')}
                                <FiArrowRight />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            );
        }

        if (layout === 'minimal') {
            return (
                <div key={banner._id} className="relative w-full aspect-[21/9] md:aspect-[3/1] min-h-[400px] md:min-h-[500px] group mb-1 border-b border-border last:border-0 overflow-hidden">
                    <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/5" />
                    
                    <div className={`absolute inset-0 max-w-[1440px] mx-auto px-6 lg:px-20 flex items-center ${isEven ? 'justify-start' : 'justify-end'}`}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="bg-background/95 backdrop-blur-md p-8 md:p-14 shadow-2xl max-w-xl ring-1 ring-black/5"
                        >
                            <h3 className="text-[10px] tracking-[0.4em] font-bold uppercase mb-4 text-primary">
                                {banner.description}
                            </h3>
                            <h2 className="text-3xl md:text-4xl font-light serif mb-6 leading-tight text-foreground">
                                {banner.title}
                            </h2>
                            <Link
                                href={banner.buttonUrl || '/collections'}
                                className="inline-flex items-center gap-2 text-foreground text-[10px] tracking-[0.2em] font-bold uppercase border-b border-foreground/20 pb-1 hover:border-primary hover:text-primary transition-all"
                            >
                                {banner.buttonText || t('common.discover')}
                                <FiArrowRight size={14} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            );
        }

        // Default Classic Layout
        return (
            <div key={banner._id} className="relative w-full h-[450px] md:h-[600px] overflow-hidden group">
                <div className="absolute inset-0">
                    <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${isEven ? 'from-black/70 via-black/20 to-transparent' : 'from-transparent via-black/20 to-black/70'}`}></div>
                </div>

                <div className={`relative h-full max-w-[1440px] mx-auto px-6 lg:px-20 flex items-center ${isEven ? 'justify-start' : 'justify-end'}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className={`max-w-xl text-white ${isEven ? 'text-left' : 'text-right flex flex-col items-end'}`}
                    >
                        <h3 className="text-xs md:text-sm tracking-[0.3em] font-medium uppercase mb-4 text-gray-300">
                            {banner.description}
                        </h3>
                        <h2 className="text-4xl md:text-6xl font-light serif mb-8 leading-tight drop-shadow-sm">
                            {banner.title}
                        </h2>
                        <Link
                            href={banner.buttonUrl || '/collections'}
                            className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95"
                        >
                            {banner.buttonText || t('common.discover')}
                            <FiArrowRight />
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    };

    return (
        <section className={`w-full flex flex-col ${layout === 'classic' ? 'gap-0.5' : 'gap-0 md:gap-8'} py-12 md:py-24`}>
            {activeGridBanners.map((banner, index) => renderBanner(banner, index))}
        </section>
    );
}
