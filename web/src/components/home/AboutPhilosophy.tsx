'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

import * as Sections from '@/types/sections';

interface AboutPhilosophyProps {
    data?: Sections.PhilosophyData;
    currentPage?: {
        philosophy?: Sections.PhilosophyData;
    } & Record<string, unknown>;
}

export default function AboutPhilosophy({ data, currentPage }: AboutPhilosophyProps) {
    const philData = data || currentPage?.philosophy;
    if (!philData?.isVisible) return null;

    return (
        <section className="py-32 bg-background relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
                    <div className="w-24 h-[1px] bg-foreground/10 mx-auto mb-12"></div>
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto overflow-hidden mb-12 shadow-xl border-4 border-background relative">
                        <Image src={philData.imageUrl || ""} alt="Process detail" fill className="object-cover" />
                    </div>
                    <blockquote className="text-2xl md:text-5xl font-serif font-light text-foreground mb-10 leading-[1.3] italic whitespace-pre-wrap">{philData.quote}</blockquote>
                    <div className="text-[10px] font-bold tracking-[0.4em] text-foreground/50 uppercase">{philData.tagline}</div>
                </motion.div>
            </div>
        </section>
    );
}
