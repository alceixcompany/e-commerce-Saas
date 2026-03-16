'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAboutSettings } from '@/lib/slices/contentSlice';

export default function AboutPage() {
    const dispatch = useAppDispatch();
    const { aboutSettings, isLoading } = useAppSelector((state) => state.content);

    useEffect(() => {
        dispatch(fetchAboutSettings());
    }, [dispatch]);

    if (isLoading || !aboutSettings) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-foreground/10 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const { hero, authenticity, showcase, philosophy, sectionOrder, hiddenSections } = aboutSettings;

    const renderSection = (sectionId: string) => {
        if (hiddenSections?.includes(sectionId)) return null;

        switch (sectionId) {
            case 'about_hero':
                if (!hero?.isVisible) return null;
                const heroLayout = hero.layout || 'fullscreen';

                if (heroLayout === 'split-visual') {
                    return (
                        <section key="hero" className="w-full min-h-[80vh] flex flex-col md:flex-row bg-background overflow-hidden">
                            <div className="w-full md:w-1/2 h-[50vh] md:h-auto relative">
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover"
                                >
                                    <source src={hero.videoUrl} type="video/mp4" />
                                </video>
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-12 lg:p-24 text-center bg-foreground/5">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1 }}
                                    className="space-y-6"
                                >
                                    <span className="text-[10px] md:text-xs tracking-[0.5em] font-bold text-foreground/50 uppercase">{hero.subtitle}</span>
                                    <h1 className="text-5xl md:text-7xl font-light serif text-foreground italic">
                                        {hero.title}
                                    </h1>
                                    <div className="h-[1px] w-16 bg-foreground/20 mx-auto mt-8"></div>
                                </motion.div>
                            </div>
                        </section>
                    );
                }

                if (heroLayout === 'minimal-centered') {
                    return (
                        <section key="hero" className="w-full py-32 bg-background flex flex-col items-center justify-center text-center px-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-6 mb-16 max-w-3xl mx-auto"
                            >
                                <span className="text-[10px] tracking-[0.4em] font-bold text-foreground/50 uppercase">{hero.subtitle}</span>
                                <h1 className="text-5xl md:text-7xl font-light serif text-foreground italic leading-tight">
                                    {hero.title}
                                </h1>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="w-full max-w-5xl aspect-video relative rounded-2xl overflow-hidden shadow-2xl"
                            >
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                >
                                    <source src={hero.videoUrl} type="video/mp4" />
                                </video>
                            </motion.div>
                        </section>
                    );
                }

                // Default: fullscreen
                return (
                    <section key="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-background">
                        <div className="absolute inset-0 z-0 opacity-60">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            >
                                <source src={hero.videoUrl} type="video/mp4" />
                            </video>
                        </div>
                        {/* Overlay: dynamic gradient based on luminance */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40 z-10" />

                        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center text-center text-foreground px-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="space-y-4"
                            >
                                <span className="text-[10px] md:text-xs tracking-[0.5em] font-light uppercase opacity-80">{hero.subtitle}</span>
                                <h1 className="text-6xl md:text-9xl font-light serif tracking-tighter mb-4 italic">
                                    {hero.title}
                                </h1>
                                <div className="h-[1px] w-24 bg-foreground/30 mx-auto"></div>
                            </motion.div>
                        </div>

                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-foreground/50">
                            <div className="w-[1px] h-12 bg-gradient-to-b from-foreground to-transparent"></div>
                        </div>
                    </section>
                );
            case 'about_authenticity':
                if (!authenticity?.isVisible) return null;
                const authLayout = authenticity.layout || 'image-right';

                return (
                    <section key="authenticity" className="w-full bg-background py-32 relative overflow-hidden">
                        <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                            {authLayout === 'stacked' ? (
                                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 1 }}
                                        viewport={{ once: true }}
                                        className="space-y-6 mb-16"
                                    >
                                        <span className="text-[10px] tracking-[0.4em] font-bold text-foreground/50 uppercase">{authenticity.tagline}</span>
                                        <h2 className="text-4xl md:text-6xl font-light text-foreground serif leading-tight italic">
                                            {authenticity.titlePart1} <span className="text-foreground/50">{authenticity.titlePart2}</span>
                                        </h2>
                                        <p className="text-lg text-foreground/70 font-light leading-relaxed max-w-2xl mx-auto italic">
                                            {authenticity.description}
                                        </p>
                                        <div className="flex items-center justify-center gap-6 pt-6 flex-col">
                                            <span className="text-xs tracking-widest uppercase font-medium text-foreground">{authenticity.buttonText}</span>
                                            <div className="h-[1px] w-12 bg-foreground/20 mt-2"></div>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                        viewport={{ once: true }}
                                        className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl"
                                    >
                                        <img src={authenticity.imageUrl} alt="Artisan process" className="w-full h-full object-cover" />
                                    </motion.div>
                                </div>
                            ) : (
                                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${authLayout === 'image-left' ? 'lg:flex-row-reverse' : ''}`}>
                                    <motion.div
                                        initial={{ opacity: 0, x: authLayout === 'image-left' ? 30 : -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 1 }}
                                        viewport={{ once: true }}
                                        className={`space-y-8 ${authLayout === 'image-left' ? 'lg:order-2' : ''}`}
                                    >
                                        <div className="space-y-4">
                                            <span className="text-[10px] tracking-[0.4em] font-bold text-foreground/50 uppercase">{authenticity.tagline}</span>
                                            <h2 className="text-4xl md:text-6xl font-light text-foreground serif leading-tight italic">
                                                {authenticity.titlePart1} <br />
                                                <span className="text-foreground/50">{authenticity.titlePart2}</span>
                                            </h2>
                                        </div>
                                        <p className="text-lg text-foreground/70 font-light leading-relaxed max-w-md italic">
                                            {authenticity.description}
                                        </p>
                                        <div className="flex items-center gap-6 pt-4">
                                            <div className="h-[1px] w-12 bg-foreground/10"></div>
                                            <span className="text-xs tracking-widest uppercase font-medium text-foreground">{authenticity.buttonText}</span>
                                        </div>
                                    </motion.div>

                                    <div className={`relative group ${authLayout === 'image-left' ? 'lg:order-1' : ''}`}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 1 }}
                                            viewport={{ once: true }}
                                            className="aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl relative"
                                        >
                                            <img
                                                src={authenticity.imageUrl}
                                                alt="Artisan process"
                                                className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent"></div>
                                        </motion.div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                );
            case 'about_showcase':
                if (!showcase?.isVisible) return null;
                const showcaseLayout = showcase.layout || 'grid-2-col';

                return (
                    <section key="showcase" className="w-full bg-background py-32" >
                        <div className="max-w-[1440px] mx-auto px-6 lg:px-20 text-center mb-16">
                            <motion.h2
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="text-foreground text-3xl md:text-5xl font-light serif italic mb-4"
                            >
                                {showcase.title}
                            </motion.h2>
                            <p className="text-foreground/50 tracking-[0.2em] uppercase text-[10px]">{showcase.subtitle}</p>
                        </div>

                        {showcaseLayout === 'masonry' ? (
                            <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                    <div className="md:col-span-8 aspect-video relative overflow-hidden group rounded-2xl bg-background/5">
                                        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                            <source src={showcase.videoUrl} type="video/mp4" />
                                        </video>
                                        <div className="absolute top-4 left-4">
                                            <span className="text-background text-[10px] tracking-widest uppercase font-bold bg-foreground/50 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">{showcase.videoLabel}</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-4 aspect-[3/4] relative overflow-hidden group rounded-2xl transform md:translate-y-12 bg-background/5">
                                        <img src={showcase.imageUrl} className="w-full h-full object-cover" alt="Showcase detail" />
                                        <div className="absolute top-4 left-4">
                                            <span className="text-background text-[10px] tracking-widest uppercase font-bold bg-foreground/50 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">{showcase.imageLabel}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : showcaseLayout === 'featured-stack' ? (
                            <div className="w-full space-y-2">
                                <div className="w-full h-[60vh] relative overflow-hidden group bg-background/5">
                                    <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700">
                                        <source src={showcase.videoUrl} type="video/mp4" />
                                    </video>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-foreground text-sm tracking-[0.3em] uppercase font-light border border-foreground/30 px-8 py-3 bg-background/20 backdrop-blur-sm shadow-2xl">{showcase.videoLabel}</span>
                                    </div>
                                </div>
                                <div className="w-full h-[40vh] relative overflow-hidden group bg-background/5">
                                    <img src={showcase.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" alt="Showcase collection" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-foreground text-sm tracking-[0.3em] uppercase font-light border border-foreground/30 px-8 py-3 bg-background/20 backdrop-blur-sm shadow-2xl">{showcase.imageLabel}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Default: grid-2-col
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-background">
                                <div className="aspect-square md:aspect-video relative overflow-hidden group bg-background/5">
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                                    >
                                        <source src={showcase.videoUrl} type="video/mp4" />
                                    </video>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-foreground/40 backdrop-blur-sm">
                                        <span className="text-background text-xs tracking-widest uppercase font-light border border-background/30 px-6 py-2 bg-foreground/50 shadow-lg">{showcase.videoLabel}</span>
                                    </div>
                                </div>
                                <div className="aspect-square md:aspect-video relative overflow-hidden group bg-background/5">
                                    <img
                                        src={showcase.imageUrl}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                                        alt="Collection showcase"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-foreground/40 backdrop-blur-sm">
                                        <span className="text-background text-xs tracking-widest uppercase font-light border border-background/30 px-6 py-2 bg-foreground/50 shadow-lg">{showcase.imageLabel}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section >
                );
            case 'about_philosophy':
                if (!philosophy?.isVisible) return null;
                const philLayout = philosophy.layout || 'centered-quote';

                return (
                    <section key="philosophy" className="py-32 bg-background relative overflow-hidden" >
                        {philLayout === 'left-aligned' ? (
                            <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                    <motion.div
                                        initial={{ opacity: 0, x: -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="lg:col-span-8 relative z-10"
                                    >
                                        <div className="w-16 h-[2px] bg-primary mb-8"></div>
                                        <blockquote className="text-3xl md:text-5xl font-serif font-light text-foreground mb-8 leading-tight italic whitespace-pre-wrap">
                                            {philosophy.quote}
                                        </blockquote>
                                        <div className="text-[10px] font-bold tracking-[0.4em] text-foreground/50 uppercase">
                                            {philosophy.tagline}
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className="lg:col-span-4"
                                    >
                                        <div className="aspect-square rounded-full overflow-hidden shadow-2xl w-3/4 lg:w-full ml-auto">
                                            <img src={philosophy.imageUrl} className="w-full h-full object-cover" alt="Philosophy detail" />
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        ) : philLayout === 'quote-focus' ? (
                            <div className="max-w-6xl mx-auto px-6 text-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="relative z-10 space-y-12"
                                >
                                    <div className="text-[10px] font-bold tracking-[0.6em] text-primary uppercase">
                                        {philosophy.tagline}
                                    </div>
                                    <blockquote className="text-4xl md:text-7xl lg:text-8xl font-serif font-light text-foreground leading-[1.1] italic whitespace-pre-wrap">
                                        {philosophy.quote}
                                    </blockquote>
                                </motion.div>
                            </div>
                        ) : (
                            // Default: centered-quote
                            <div className="max-w-4xl mx-auto px-6 text-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="relative z-10"
                                >
                                    <div className="w-24 h-[1px] bg-foreground/10 mx-auto mb-12"></div>
                                    <img
                                        src={philosophy.imageUrl}
                                        className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto object-cover mb-12 shadow-xl border-4 border-background"
                                        alt="Process detail"
                                    />
                                    <blockquote className="text-2xl md:text-5xl font-serif font-light text-foreground mb-10 leading-[1.3] italic whitespace-pre-wrap">
                                        {philosophy.quote}
                                    </blockquote>
                                    <div className="text-[10px] font-bold tracking-[0.4em] text-foreground/50 uppercase">
                                        {philosophy.tagline}
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Background Decorative Text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0 pointer-events-none opacity-[0.03] text-[20vw] font-serif italic whitespace-nowrap select-none overflow-hidden max-w-full text-center text-foreground">
                            {philosophy.backgroundText}
                        </div>
                    </section >
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-background min-h-screen font-sans selection:bg-primary/30">
            {sectionOrder?.map(sectionId => renderSection(sectionId))}
        </div >
    );
}
