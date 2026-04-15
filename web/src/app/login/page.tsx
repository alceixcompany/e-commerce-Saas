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
import type { PageSection } from '@/types/page';
import * as Sections from '@/types/sections';

function LoginContent() {
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
	                const tasks: Promise<unknown>[] = [dispatch(fetchAuthSettings(true)) as unknown as Promise<unknown>];
	                if (isPreview) {
	                    tasks.push(dispatch(fetchPageBySlug('login')) as unknown as Promise<unknown>);
	                    tasks.push(dispatch(fetchComponentInstances()) as unknown as Promise<unknown>);
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

	    type RenderableSection = string | (PageSection & { instanceData?: Sections.SectionData });
	    const sections: RenderableSection[] =
	        isPreview && currentPage?.slug === 'login' ? ((currentPage.sections || []) as RenderableSection[]) : [];

    return (
        <div className="bg-background min-h-screen font-sans selection:bg-primary/30">
	            <div className="w-full flex flex-col pt-20">
	                {sections.length > 0 ? (
	                    sections.map((section) => (
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

export default function LoginPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-transparent" />}>
            <LoginContent />
        </React.Suspense>
    );
}
