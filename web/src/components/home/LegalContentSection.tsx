'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { sanitizeHtml } from '@/lib/utils/safeHtml';

import { LegalData } from '@/types/sections';

interface LegalContentSectionProps {
    instanceId?: string;
    data?: LegalData;
}

export default function LegalContentSection({ instanceId, data: passedData }: LegalContentSectionProps) {
    const { t } = useTranslation();
    const { instances } = useCmsStore();

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const data: LegalData = (passedData || instance?.data || {
        title: t('home.legal.title'),
        content: t('home.legal.empty'),
        variant: 'standard'
    }) as LegalData;
    const sanitizedContent = useMemo(() => sanitizeHtml(data.content), [data.content]);

    const renderStandard = () => (
        <div className="max-w-4xl mx-auto">
            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert 
                prose-headings:serif prose-headings:font-light prose-headings:tracking-tight
                prose-p:text-foreground prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-bold"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
        </div>
    );

    const renderCompact = () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-4 translate-y-1">
                <h2 className="text-2xl md:text-3xl font-light serif text-foreground tracking-tight sticky top-32">
                    {data.title}
                </h2>
                <div className="w-12 h-[1px] bg-primary/30 mt-6 hidden lg:block"></div>
            </div>
            <div className="lg:col-span-8">
                <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert 
                    prose-headings:serif prose-headings:font-light
                    prose-p:text-foreground prose-p:leading-relaxed
                    prose-a:text-primary prose-strong:text-foreground"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
            </div>
        </div>
    );

    const renderBoxed = () => (
        <div className="max-w-5xl mx-auto">
            <div className="bg-muted/30 backdrop-blur-sm border border-border rounded-[2rem] p-8 md:p-16 shadow-sm">
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert 
                    prose-headings:serif prose-headings:font-light
                    prose-p:text-foreground prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
            </div>
        </div>
    );

    return (
        <section className="w-full bg-background py-20 md:py-32 overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                {/* Header for non-compact variants */}
                {data.variant !== 'compact' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16 md:mb-24"
                    >
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="w-8 h-[1px] bg-primary/30"></div>
                            <span className="text-[10px] md:text-xs tracking-[0.4em] font-bold text-primary uppercase">
                                {t('home.legal.tagline')}
                            </span>
                            <div className="w-8 h-[1px] bg-primary/30"></div>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-light text-foreground serif lowercase tracking-tighter">
                            {data.title}
                        </h2>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    {data.variant === 'compact' && renderCompact()}
                    {data.variant === 'boxed' && renderBoxed()}
                    {(data.variant === 'standard' || !data.variant) && renderStandard()}
                </motion.div>
            </div>
        </section>
    );
}
