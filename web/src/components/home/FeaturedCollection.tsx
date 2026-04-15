'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/lib/hooks';
import { useTranslation } from '@/hooks/useTranslation';

import * as Sections from '@/types/sections';

export default function FeaturedCollection({ instanceId, data: passedData }: { instanceId?: string, data?: Sections.FeaturedData }) {
    const {  homeSettings } = useAppSelector((state) => state.content);
    const { instances } = useAppSelector((state) => state.component);
    const { t } = useTranslation();
 
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const data = passedData || (instance?.data as Sections.FeaturedData) || (homeSettings?.featuredSection as Sections.FeaturedData);
    const isVisible = data?.isVisible !== false;

    if (!isVisible) return null;

    const title = data?.title || t('admin.promo.classic');
    const description = data?.description || t('hero.desc');
    const mediaUrl = data?.mediaUrl || "/image/alceix/hero.png";
    const mediaType = data?.mediaType || "image";
    const buttonText = data?.buttonText || t('common.discover').toUpperCase();
    const buttonUrl = data?.buttonUrl || "/collections";
    const layout = data?.layout || "left"; // left or right (image position)

    return (
        <section className="w-full bg-background py-24 md:py-40 relative overflow-hidden">
            {/* Decorative background element */}
            <div className={`absolute top-0 ${layout === 'left' ? 'right-0' : 'left-0'} w-1/3 h-full bg-primary/5 -z-0 rounded-l-[100px] transform ${layout === 'left' ? 'translate-x-20' : '-translate-x-20'}`}></div>

            <div className="max-w-[1440px] mx-auto px-6 lg:px-20 relative z-10">
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center ${layout === 'right' ? 'lg:flex-row-reverse' : ''}`}>

                    {/* Media Container */}
                    <div className={`lg:col-span-7 group ${layout === 'right' ? 'lg:order-2' : ''}`}>
                        <motion.div
                            initial={{ opacity: 0, x: layout === 'left' ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-2xl"
                        >
                            {mediaType === 'video' ? (
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-[2000ms] group-hover:scale-105"
                                >
                                    <source src={mediaUrl} type="video/mp4" />
                                </video>
                            ) : (
                                <Image
                                    src={mediaUrl}
                                    alt={title}
                                    fill
                                    className="object-cover grayscale-[0.2] transition-transform duration-[2000ms] group-hover:scale-105"
                                />
                            )}

                            {/* Glassmorphism Overlay Info */}
                            {(data?.overlayTitle || data?.overlayDescription) && (
                                <div className="absolute bottom-10 left-10 right-10 p-8 pt-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700">
                                    <p className="text-white text-xs tracking-[0.3em] font-medium uppercase mb-2">{data.overlayTitle}</p>
                                    <p className="text-white/80 text-sm font-light italic">{data.overlayDescription}</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className={`lg:col-span-5 flex flex-col items-start space-y-12 ${layout === 'right' ? 'lg:order-1' : ''}`}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-[1px] bg-primary"></div>
                                <span className="text-[10px] md:text-xs tracking-[0.4em] font-bold text-primary uppercase">
                                    {t('common.featuredTreasures')}
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-light text-foreground serif leading-[1.2]">
                                {title}
                            </h2>

                            <p className="text-sm md:text-base text-foreground/60 font-light leading-relaxed tracking-wide max-w-sm">
                                {description}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            <Link
                                href={buttonUrl}
                                className="relative z-10 inline-block bg-foreground text-background px-12 md:px-20 py-5 transition-all duration-500 font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-foreground/80 shadow-2xl"
                            >
                                {buttonText}
                            </Link>
                            <div className="absolute -bottom-2 -right-2 w-full h-full border border-primary transition-all duration-300 group-hover:bottom-0 group-hover:right-0"></div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
