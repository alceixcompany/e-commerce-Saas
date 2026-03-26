'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector } from '@/lib/hooks';

interface CampaignSectionProps {
    data?: any;
    instanceId?: string;
}

const CampaignSection: React.FC<CampaignSectionProps> = ({ data, instanceId }) => {
    const { t } = useTranslation();
    const { instances } = useAppSelector(state => state.component);
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const instanceData = instance?.data || data;

    if (!instanceData || !instanceData.isVisible) return null;
    const finalData = instanceData;

    return (
        <section className="py-24 bg-background">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12">
                {finalData.title && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <h2 className="text-3xl md:text-5xl font-heading font-light tracking-tight text-foreground/80 lowercase italic">
                            {finalData.title}
                        </h2>
                        <div className="h-[1px] w-24 bg-primary/20 mx-auto mt-6" />
                    </motion.div>
                )}

                <div className={`grid gap-8 ${finalData.layout === 'split'
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                    {finalData.items.map((item: any, index: number) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: index * 0.1 }}
                            className="group relative h-[400px] md:h-[500px] overflow-hidden rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-700"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={item.image || "/image/alceix/product.png"}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                {/* Premium Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end items-center text-center">
                                <motion.span
                                    className="text-[10px] tracking-[0.3em] uppercase font-bold text-primary mb-3 bg-foreground/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-foreground/5"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {t('common.exclusiveCampaign')}
                                </motion.span>
                                <motion.h3
                                    className="text-2xl md:text-3xl font-heading text-white mb-3 drop-shadow-sm font-light italic"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {item.title}
                                </motion.h3>
                                <motion.p
                                    className="text-white/80 text-sm md:text-base font-medium max-w-[280px] mb-8"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    {item.subtitle}
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Link
                                        href={item.buttonUrl}
                                        className="group/btn relative inline-flex items-center gap-3 bg-background text-foreground px-8 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-primary hover:text-white shadow-xl active:scale-95 border border-foreground/10"
                                    >
                                        {item.buttonText}
                                        <div className="w-1.5 h-1.5 bg-primary group-hover/btn:bg-white rounded-full transition-colors" />
                                    </Link>
                                </motion.div>
                            </div>

                            {/* Decorative Frame */}
                            <div className="absolute inset-4 border border-white/10 rounded-xl pointer-events-none group-hover:inset-6 transition-all duration-700" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CampaignSection;
