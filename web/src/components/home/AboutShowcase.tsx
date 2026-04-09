'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AboutShowcaseProps {
    data: any;
    currentPage: any;
}

export default function AboutShowcase({ data, currentPage }: AboutShowcaseProps) {
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
