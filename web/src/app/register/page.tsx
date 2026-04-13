'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchComponentInstances } from '@/lib/slices/componentSlice';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import SectionRenderer from '@/components/SectionRenderer';
import { fetchAuthSettings } from '@/lib/slices/contentSlice';
import AuthSection from '@/components/auth/AuthSection';
import { useTranslation } from '@/hooks/useTranslation';

function RegisterContent() {
    const searchParams = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    
    const { currentPage } = useAppSelector((state) => state.pages);
    const { instances } = useAppSelector((state) => state.component);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initPage = async () => {
            try {
                const tasks: Promise<any>[] = [dispatch(fetchAuthSettings(true)) as any];
                if (isPreview) {
                    tasks.push(dispatch(fetchPageBySlug('register')) as any);
                    tasks.push(dispatch(fetchComponentInstances()) as any);
                }
                await Promise.allSettled(tasks);
            } finally {
                setIsInitialized(true);
            }
        };
        initPage();
    }, [dispatch, isPreview]);

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[10px] font-bold tracking-[0.4em] text-foreground/20 uppercase"
                >
                    {t('auth.loading')}
                </motion.div>
            </div>
        );
    }

    const sections = isPreview && currentPage?.slug === 'register' ? (currentPage.sections || []) : [];

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
                    <AuthSection data={{ type: 'register' }} />
                )}
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-transparent" />}>
            <RegisterContent />
        </React.Suspense>
    );
}
