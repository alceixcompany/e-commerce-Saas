'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/lib/hooks';
import { useTranslation } from '@/hooks/useTranslation';
import { FiTruck, FiShield, FiHeart, FiClock } from 'react-icons/fi';

const IconMap: Record<string, React.ElementType> = {
  FiTruck,
  FiShield,
  FiClock,
  FiHeart,
};

interface AdvantageSectionProps {
    instanceId?: string;
    data?: {
        title?: string;
        isVisible?: boolean;
        items?: {
            id: string;
            icon: string;
            title: string;
            description: string;
        }[];
    };
}

const AdvantageSection: React.FC<AdvantageSectionProps> = ({ instanceId, data: passedData }) => {
    const { t } = useTranslation();
    const { instances } = useAppSelector((state) => state.component);
    const { homeSettings } = useAppSelector((state) => state.content);
 
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const instanceData = passedData || instance?.data;
    const isVisible = instanceData?.isVisible !== false;

    if (!isVisible && instanceId) return null;

    const defaultAdvantages = [
        {
            id: '1',
            icon: 'FiTruck',
            title: t('home.advantages.delivery'),
            description: t('home.advantages.deliveryDesc'),
        },
        {
            id: '2',
            icon: 'FiShield',
            title: t('home.advantages.authentic'),
            description: t('home.advantages.authenticDesc'),
        },
        {
            id: '3',
            icon: 'FiHeart',
            title: t('home.advantages.support'),
            description: t('home.advantages.supportDesc'),
        },
    ];

    const finalData = instanceData?.items || homeSettings?.advantageSection?.advantages || defaultAdvantages;
    const sectionTitle = instanceData?.title || homeSettings?.advantageSection?.title || t('home.advantages.title');

    const renderIcon = (iconName: string) => {
        const IconComponent = IconMap[iconName] || FiShield;
        return <IconComponent size={32} strokeWidth={1.2} />;
    };

    return (
        <section className="py-24 bg-background overflow-hidden border-t border-foreground/5">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12">
                {sectionTitle && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-heading font-light tracking-tight text-foreground/80 lowercase italic">
                            {sectionTitle}
                        </h2>
                        <div className="h-[1px] w-24 bg-primary/20 mx-auto mt-6"></div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
                    {finalData.map((item: any, index: number) => (
                        <motion.div
                            key={item.id || index}
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
