'use client';

import React, { useEffect, Suspense } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import { fetchGlobalSettings } from '@/lib/slices/contentSlice';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import SectionRenderer from '@/components/SectionRenderer';

// Fallback sections if the page is not yet defined in the database
const DEFAULT_SECTIONS = [
    { id: 'blog_list', isActive: true, instanceData: {} }
];

function JournalContent() {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';

    const { currentPage, loading: pageLoading, hasLoadedOnce } = useAppSelector((state) => state.pages);
    const { instances } = useAppSelector((state) => state.component);
    const { t } = useTranslation();

    const isLoading = pageLoading.fetchOne && !hasLoadedOnce;

    useEffect(() => {
        if (!hasLoadedOnce || (currentPage && currentPage.slug !== 'journal')) {
            dispatch(fetchPageBySlug('journal'));
        }
    }, [dispatch, hasLoadedOnce, currentPage]);

    if (isLoading && !currentPage) {
        return (
            <div className="min-h-screen bg-background pt-[120px] flex justify-center items-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/20 italic">{t('search.awaiting')}</span>
                </div>
            </div>
        );
    }

    const sections = isPreview 
        ? (currentPage?.sections || [])
        : (currentPage?.slug === 'journal' && currentPage?.sections?.length > 0) 
            ? currentPage.sections 
            : DEFAULT_SECTIONS;

    return (
        <div className="min-h-screen bg-background pt-[90px] md:pt-[120px] pb-16 md:pb-32 overflow-x-hidden">
            <main className="w-full flex flex-col">
                {sections.map((section: any, idx: number) => (
                    <SectionRenderer
                        key={typeof section === 'string' ? `${section}-${idx}` : (section.id || idx)}
                        section={section}
                        instances={instances}
                        currentPage={currentPage}
                    />
                ))}
            </main>
        </div>
    );
}

export default function JournalPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
            <JournalContent />
        </React.Suspense>
    );
}
