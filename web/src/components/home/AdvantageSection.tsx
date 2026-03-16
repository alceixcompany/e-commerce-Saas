'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { AdvantageSection as AdvantageSectionType } from '@/lib/slices/contentSlice';

interface AdvantageSectionProps {
    data?: AdvantageSectionType;
}

const AdvantageSection: React.FC<AdvantageSectionProps> = ({ data }) => {
    if (!data || !data.isVisible) return null;

    const renderIcon = (iconName: string) => {
        const IconComponent = (FiIcons as any)[iconName];
        return IconComponent ? <IconComponent size={32} strokeWidth={1.2} /> : null;
    };

    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12">
                {data.title && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-light tracking-tight text-foreground/80 lowercase">
                            {data.title}
                        </h2>
                        <div className="h-[1px] w-24 bg-primary/30 mx-auto mt-6"></div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
                    {data.advantages.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            className="flex flex-col items-center text-center group cursor-default"
                        >
                            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center text-primary/60 mb-8 transition-all duration-500 group-hover:bg-primary/10 group-hover:scale-110 group-hover:text-primary">
                                {renderIcon(item.icon)}
                            </div>
                            <h3 className="text-lg font-bold tracking-[0.15em] uppercase text-foreground/70 mb-3 group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm text-foreground/40 font-medium leading-relaxed max-w-[280px]">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AdvantageSection;
