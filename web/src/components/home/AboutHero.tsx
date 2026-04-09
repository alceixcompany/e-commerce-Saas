'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AboutHeroProps {
    data: any;
    currentPage: any;
}

export default function AboutHero({ data, currentPage }: AboutHeroProps) {
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
