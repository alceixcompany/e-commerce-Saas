'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/lib/hooks';
import { useTranslation } from '@/hooks/useTranslation';

import { PageHeroData } from '@/types/sections';

interface PageHeroProps {
    instanceId?: string;
    // For direct use without instances (backwards compatibility)
    data?: PageHeroData;
}

export default function PageHero({ instanceId, data: directData }: PageHeroProps) {
    const { instances } = useAppSelector((state) => state.component);
    const { t } = useTranslation();
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    
    // Prioritize directData (prop) over instance data from store
    const data: PageHeroData = (directData || instance?.data || {
        title: t('home.pageHero.defaultTitle'),
        subtitle: t('home.pageHero.defaultSubtitle'),
        backgroundImageUrl: '',
        variant: 'classic'
    }) as PageHeroData;

    const variant = data.variant || 'classic';

    if (variant === 'minimal') {
        return (
            <div className="pt-40 pb-20 bg-background px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="block text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-4"
                    >
                        {data.subtitle}
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-light serif text-foreground tracking-tight leading-tight"
                    >
                        {data.title}
                    </motion.h1>
                    <div className="w-16 h-px bg-foreground/10 mx-auto mt-8"></div>
                </div>
            </div>
        );
    }

    if (variant === 'split') {
        return (
            <div className="pt-32 pb-0 lg:pt-0 bg-background overflow-hidden">
                <div className="flex flex-col lg:flex-row min-h-[60vh]">
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-12 lg:p-24 bg-foreground/[0.02]">
                        <div className="max-w-md">
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="block text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-6"
                            >
                                {data.subtitle}
                            </motion.span>
                            <motion.h1
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl lg:text-6xl font-light serif text-foreground leading-tight tracking-tight"
                            >
                                {data.title}
                            </motion.h1>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 relative min-h-[400px]">
                        {data.backgroundImageUrl ? (
                            <Image 
                                src={data.backgroundImageUrl || ""} 
                                alt={data.title || ""}
                                fill
                                priority
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-foreground/5 flex items-center justify-center">
                                <span className="text-foreground/10 font-serif italic text-4xl opacity-30">{t('home.pageHero.placeholder')}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-foreground/10 lg:bg-transparent"></div>
                    </div>
                </div>
                <div className="h-px w-full bg-foreground/5"></div>
            </div>
        );
    }

    // Default: 'classic'
    return (
        <div className="relative pt-48 pb-32 flex items-center justify-center text-center px-6 overflow-hidden min-h-[60vh]">
            {data.backgroundImageUrl && (
                <div className="absolute inset-0 z-0 h-full w-full">
                    <Image 
                        src={data.backgroundImageUrl || ""}
                        alt=""
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                </div>
            )}
            
            <div className={`relative z-10 max-w-4xl ${data.backgroundImageUrl ? 'text-white' : 'text-foreground'}`}>
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`block ${data.backgroundImageUrl ? 'text-white/80' : 'text-primary'} text-[10px] font-bold tracking-[0.4em] uppercase mb-6`}
                >
                    {data.subtitle}
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-light serif tracking-tight leading-tight"
                >
                    {data.title}
                </motion.h1>
                <div className="w-20 h-0.5 bg-primary/60 mx-auto mt-12 mb-4"></div>
            </div>
        </div>
    );
}
