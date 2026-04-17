'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useTranslation } from '@/hooks/useTranslation';

import { PageHeroData } from '@/types/sections';

interface PageHeroProps {
    instanceId?: string;
    // For direct use without instances (backwards compatibility)
    data?: PageHeroData;
}

export default function PageHero({ instanceId, data: directData }: PageHeroProps) {
    const { instances } = useCmsStore();
    const { t } = useTranslation();
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Parallax scrolling
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
    
    // Prioritize directData (prop) over instance data from store
    const data: PageHeroData = (directData || instance?.data || {
        title: t('home.pageHero.defaultTitle'),
        subtitle: t('home.pageHero.defaultSubtitle'),
        backgroundImageUrl: '',
        variant: 'classic'
    }) as PageHeroData;

    const variant = data.variant || 'classic';

    if (variant === 'minimal') {
        const letters = data.title ? data.title.split('') : [];
        
        return (
            <div ref={containerRef} className="relative pt-48 pb-32 bg-background overflow-hidden min-h-[70vh] flex flex-col justify-center border-b border-foreground/5">
                {/* Background Giant Marquee / Kinetic Typography */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full overflow-hidden pointer-events-none select-none opacity-[0.02] flex whitespace-nowrap z-0">
                    <motion.div 
                        initial={{ x: 0 }}
                        animate={{ x: "-50%" }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="text-[15rem] md:text-[25rem] font-black uppercase tracking-tighter leading-none"
                    >
                        {data.subtitle || "FOCUS"} • {data.subtitle || "FOCUS"} • {data.subtitle || "FOCUS"} • {data.subtitle || "FOCUS"}
                    </motion.div>
                </div>
                
                {/* Architectural Grid Lines */}
                <div className="absolute top-0 bottom-0 left-[5%] md:left-[10%] w-px bg-foreground/10 z-0 hidden sm:block" />
                <div className="absolute top-0 bottom-0 right-[5%] md:right-[10%] w-px bg-foreground/10 z-0 hidden sm:block" />

                <motion.div style={{ y: textY, opacity: contentOpacity }} className="relative w-full max-w-7xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 px-6 sm:px-[5%] md:px-[10%]">
                    <div className="lg:col-span-3 flex flex-col justify-end pb-2 lg:pb-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col gap-4"
                        >
                            <div className="w-12 h-[2px] bg-foreground/80" />
                            <span className="text-foreground/50 text-[10px] font-bold tracking-[0.4em] uppercase">
                                {data.subtitle}
                            </span>
                        </motion.div>
                    </div>
                    <div className="lg:col-span-9">
                        <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-light serif text-foreground tracking-tight leading-[1.05] inline-block">
                            {letters.map((char, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0, y: 40, rotateX: 90 }}
                                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                    transition={{ 
                                        delay: 0.1 + (index * 0.02), 
                                        duration: 0.8, 
                                        ease: [0.16, 1, 0.3, 1] 
                                    }}
                                    className="inline-block"
                                    style={{ transformOrigin: "bottom" }}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </motion.span>
                            ))}
                        </h1>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (variant === 'split') {
        return (
            <div ref={containerRef} className="pt-24 lg:pt-0 bg-background overflow-hidden border-b border-border">
                <div className="flex flex-col lg:flex-row min-h-[60vh] lg:min-h-[80vh]">
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-12 lg:p-24 relative z-10">
                        {/* Soft geometric background texture */}
                        <div className="absolute inset-0 bg-gradient-to-br from-background via-foreground/[0.01] to-muted/20" />
                        <div className="absolute right-0 top-1/4 w-[300px] h-[300px] bg-primary/[0.03] blur-[100px] rounded-full pointer-events-none" />
                        
                        <motion.div style={{ y: textY, opacity: contentOpacity }} className="max-w-md relative z-10 w-full">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="flex items-center gap-4 mb-8"
                            >
                                <span className="block text-primary text-[10px] font-bold tracking-[0.4em] uppercase">
                                    {data.subtitle}
                                </span>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="text-4xl md:text-5xl lg:text-[4.5rem] font-light serif text-foreground leading-[1.05] tracking-tight"
                            >
                                {data.title}
                            </motion.h1>
                            
                            <motion.div 
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                                style={{ originX: 0 }}
                                className="w-24 h-px bg-foreground/10 mt-12"
                            />
                        </motion.div>
                    </div>
                    <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-full overflow-hidden">
                        {data.backgroundImageUrl ? (
                            <motion.div 
                                style={{ y: backgroundY }}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className="absolute inset-0 w-full h-[120%] -top-[10%]"
                            >
                                <Image 
                                    src={data.backgroundImageUrl || ""} 
                                    alt={data.title || ""}
                                    fill
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </motion.div>
                        ) : (
                            <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
                                <span className="text-foreground/10 font-serif italic text-4xl opacity-30">{t('home.pageHero.placeholder')}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-background/60 lg:via-background/10 lg:to-transparent"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Default: 'classic'
    return (
        <div ref={containerRef} className="relative flex items-center justify-center text-center px-6 overflow-hidden min-h-[70vh] lg:min-h-[85vh]">
            {data.backgroundImageUrl ? (
                <motion.div 
                    style={{ y: backgroundY }}
                    className="absolute inset-0 z-0 w-full h-[120%] -top-[10%]"
                >
                    <motion.div 
                        initial={{ scale: 1.1, filter: 'blur(10px)' }}
                        animate={{ scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full relative"
                    >
                        <Image 
                            src={data.backgroundImageUrl || ""}
                            alt=""
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
                </motion.div>
            ) : (
                <div className="absolute inset-0 z-0 h-full w-full bg-muted/20">
                     <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-foreground/10 font-serif italic text-4xl opacity-30">{t('home.pageHero.placeholder')}</span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent z-10"></div>
                </div>
            )}
            
            {/* Main Content */}
            <motion.div 
                style={{ y: textY, opacity: contentOpacity }}
                className={`relative z-20 max-w-5xl w-full flex flex-col items-center justify-center ${data.backgroundImageUrl ? 'text-white' : 'text-foreground'}`}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-8"
                >
                    <span className={`inline-block px-5 py-2 rounded-full ${data.backgroundImageUrl ? 'bg-white/10 text-white/90 border-white/20' : 'bg-foreground/5 text-foreground/80 border-foreground/10'} border backdrop-blur-md text-[10px] font-bold tracking-[0.4em] uppercase shadow-2xl`}>
                        {data.subtitle}
                    </span>
                </motion.div>
                
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl md:text-7xl lg:text-[6rem] font-light serif tracking-tight leading-[1.05]"
                    style={data.backgroundImageUrl ? { textShadow: '0 10px 30px rgba(0,0,0,0.5)' } : {}}
                >
                    {data.title}
                </motion.h1>
            </motion.div>

            {/* Premium Scroll Indicator */}
            <motion.div 
                style={{ opacity: contentOpacity }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20"
            >
                <div className={`w-[1px] h-16 ${data.backgroundImageUrl ? 'bg-white/20' : 'bg-foreground/20'} relative overflow-hidden`}>
                    <motion.div 
                        className={`w-full absolute left-0 ${data.backgroundImageUrl ? 'bg-white' : 'bg-foreground'}`}
                        initial={{ top: "-100%", height: "50%" }}
                        animate={{ top: "150%" }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                    />
                </div>
            </motion.div>
            
            {/* Blending block at the very bottom */}
            {data.backgroundImageUrl && (
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent z-10"></div>
            )}
        </div>
    );
}
