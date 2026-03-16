'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ContactHeroProps {
    data: {
        isVisible: boolean;
        title: string;
        subtitle: string;
        backgroundImageUrl: string;
    }
}

export default function ContactHero({ data }: ContactHeroProps) {
    if (!data.isVisible) return null;

    return (
        <div 
            className="relative pt-32 pb-24 flex items-center justify-center text-center px-6 overflow-hidden min-h-[40vh]"
        >
            {data.backgroundImageUrl && (
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${data.backgroundImageUrl})` }}
                >
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
            )}
            
            <div className={`relative z-10 ${data.backgroundImageUrl ? 'text-white' : 'text-foreground'}`}>
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`block ${data.backgroundImageUrl ? 'text-white' : 'text-primary'} text-xs font-bold tracking-[0.3em] uppercase mb-4`}
                >
                    {data.subtitle}
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-light serif tracking-wide"
                >
                    {data.title}
                </motion.h1>
            </div>
        </div>
    );
}
