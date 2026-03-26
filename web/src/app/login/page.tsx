'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import { fetchComponentInstances } from '@/lib/slices/componentSlice';
import SectionRenderer from '@/components/SectionRenderer';
import { fetchGlobalSettings } from '@/lib/slices/contentSlice';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';
    const dispatch = useAppDispatch();
    
    const { currentPage, isLoading } = useAppSelector((state) => state.pages);
    const { instances } = useAppSelector((state) => state.component);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initPage = async () => {
            await Promise.all([
                dispatch(fetchPageBySlug('login')),
                dispatch(fetchComponentInstances()),
                dispatch(fetchGlobalSettings())
            ]);
            setIsInitialized(true);
        };
        initPage();
    }, [dispatch]);

    if (!isInitialized || isLoading) {
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

    const visibleSections = currentPage?.sections || [];

    return (
        <div className="bg-background min-h-screen font-sans selection:bg-primary/30">
            <div className="w-full flex flex-col pt-20">
                {visibleSections.length > 0 ? (
                    visibleSections.map((section: any) => (
                        <SectionRenderer 
                            key={typeof section === 'string' ? section : section.id} 
                            section={section} 
                            instances={instances} 
                            currentPage={currentPage}
                        />
                    ))
                ) : (
                    <div className="min-h-[60vh] flex items-center justify-center">
                        <p className="text-[10px] font-bold tracking-[0.4em] text-foreground/20 uppercase">No Content Configured</p>
                    </div>
                )}
            </div>
        </div>
    );
}
