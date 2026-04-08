'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchComponentInstances } from '@/lib/slices/componentSlice';
import SectionRenderer from '@/components/SectionRenderer';
import { fetchGlobalSettings, fetchAuthSettings } from '@/lib/slices/contentSlice';
import AuthSection from '@/components/auth/AuthSection';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';
    const dispatch = useAppDispatch();
    
    const { currentPage } = useAppSelector((state) => state.pages);
    const { instances, loading: componentLoading } = useAppSelector((state) => state.component);
    const isInstancesLoading = componentLoading.fetchAll;
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initPage = async () => {
            try {
                // We use settle to ensure we proceed even if page-specific data is missing
                await Promise.allSettled([
                    dispatch(fetchComponentInstances()),
                    dispatch(fetchGlobalSettings(true)),
                    dispatch(fetchAuthSettings(true))
                ]);
            } finally {
                setIsInitialized(true);
            }
        };
        initPage();
    }, [dispatch]);

    // Only show loading if we are truly in the middle of initialization
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[10px] font-bold tracking-[0.4em] text-foreground/20 uppercase"
                >
                    Loading Experience
                </motion.div>
            </div>
        );
    }

    // Avoid stale page slice state forcing a wrong layout on auth pages.
    const sections = isPreview ? (currentPage?.sections || []) : [];

    return (
        <div className="bg-background min-h-screen font-sans selection:bg-primary/30">
            <div className="w-full flex flex-col pt-20">
                {sections.length > 0 ? (
                    sections.map((section: any) => (
                        <SectionRenderer 
                            key={typeof section === 'string' ? section : section.id} 
                            section={section} 
                            instances={instances} 
                            currentPage={currentPage}
                        />
                    ))
                ) : (
                    <AuthSection data={{ type: 'login' }} />
                )}
            </div>
        </div>
    );
}
