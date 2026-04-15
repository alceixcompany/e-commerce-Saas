'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { AboutSettings } from '@/types/content';
import type { CustomPage } from '@/types/page';

interface AboutAuthenticityProps {
    data?: AboutSettings['authenticity'];
    currentPage?: CustomPage | null;
}

export default function AboutAuthenticity({ data, currentPage }: AboutAuthenticityProps) {
    const authData = (data || currentPage?.authenticity) as AboutSettings['authenticity'] | undefined;
    if (!authData?.isVisible) return null;
    const authLayout = authData.layout || 'image-right';

    return (
        <section className="w-full bg-background py-32 relative overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                {authLayout === 'stacked' ? (
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} viewport={{ once: true }} className="space-y-6 mb-16">
                            <span className="text-[10px] tracking-[0.4em] font-bold text-foreground/50 uppercase">{authData.tagline}</span>
                            <h2 className="text-4xl md:text-6xl font-light text-foreground serif leading-tight italic">
                                {authData.titlePart1} <span className="text-foreground/50">{authData.titlePart2}</span>
                            </h2>
                            <p className="text-lg text-foreground/70 font-light leading-relaxed max-w-2xl mx-auto italic">{authData.description}</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} viewport={{ once: true }} className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl relative">
                            <Image src={authData.imageUrl || "/image/alceix/hero.png"} alt="Artisan process" fill className="object-cover" />
                        </motion.div>
                    </div>
                ) : (
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${authLayout === 'image-left' ? 'lg:flex-row-reverse' : ''}`}>
                        <motion.div initial={{ opacity: 0, x: authLayout === 'image-left' ? 30 : -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} viewport={{ once: true }} className={`space-y-8 ${authLayout === 'image-left' ? 'lg:order-2' : ''}`}>
                            <div className="space-y-4">
                                <span className="text-[10px] tracking-[0.4em] font-bold text-foreground/50 uppercase">{authData.tagline}</span>
                                <h2 className="text-4xl md:text-6xl font-light text-foreground serif leading-tight italic">{authData.titlePart1} <br /><span className="text-foreground/50">{authData.titlePart2}</span></h2>
                            </div>
                            <p className="text-lg text-foreground/70 font-light leading-relaxed max-w-md italic">{authData.description}</p>
                        </motion.div>
                        <div className={`relative group ${authLayout === 'image-left' ? 'lg:order-1' : ''}`}>
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} viewport={{ once: true }} className="aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl relative">
                                <Image src={authData.imageUrl || "/image/alceix/hero.png"} alt="Artisan process" fill className="object-cover transition-transform duration-[3s] group-hover:scale-110" />
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
