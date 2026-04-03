'use client';
import React, { useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import { fetchComponentInstances } from '@/lib/slices/componentSlice';

import SectionRenderer from '@/components/SectionRenderer';

export default function AboutPage() {
    const dispatch = useAppDispatch();
    const { currentPage, isLoading } = useAppSelector((state) => state.pages);
    const { instances } = useAppSelector((state) => state.component);

    useEffect(() => {
        dispatch(fetchPageBySlug('about'));
    }, [dispatch]);

    if (isLoading || !currentPage) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-foreground/10 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const sections = currentPage.sections || [];
    const visibleSections = sections.filter((s: any) => s.isActive !== false);

    if (visibleSections.length === 0) {
        return null;
    }

    return (
        <div className="bg-background min-h-screen font-sans selection:bg-primary/30">
            <div className="w-full flex flex-col">
                {visibleSections.map((section: any) => (
                    <SectionRenderer
                        key={typeof section === 'string' ? section : section.id}
                        section={section}
                        instances={instances}
                        currentPage={currentPage}
                    />
                ))}
            </div>
        </div>
    );
}
