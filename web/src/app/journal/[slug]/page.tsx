'use client';

import React, { useEffect, Suspense } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import { fetchGlobalSettings } from '@/lib/slices/contentSlice';
import { useSearchParams } from 'next/navigation';
import SectionRenderer from '@/components/SectionRenderer';
import { useTranslation } from '@/hooks/useTranslation';

const DEFAULT_DETAIL_SECTIONS = [
    { id: 'blog_detail', isActive: true, instanceData: {} }
];

function JournalDetailContent({ params }: { params: any }) {
    const searchParams = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';
    const { t } = useTranslation();

    const resolvedParams = params instanceof Promise || (params && typeof params.then === 'function')
        ? React.use(params)
        : params;

    const slug = resolvedParams?.slug;
    const dispatch = useAppDispatch();

    const { currentPage, loading: pageLoading, hasLoadedOnce } = useAppSelector((state) => state.pages);
    const { instances } = useAppSelector((state) => state.component);

    const isLoading = pageLoading.fetchOne && !hasLoadedOnce;

    useEffect(() => {
        dispatch(fetchGlobalSettings());
        if (!hasLoadedOnce || (currentPage && currentPage.slug !== 'journal-detail')) {
            dispatch(fetchPageBySlug('journal-detail'));
        }
    }, [dispatch, hasLoadedOnce, currentPage]);

    if (isLoading && !currentPage) {
        return (
            <div className="min-h-screen bg-background pt-[120px] flex justify-center items-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/20 italic">{t('journal.curating')}</span>
                </div>
            </div>
        );
    }

    // Determine which sections to render
    const sections = isPreview
        ? (currentPage?.sections || [])
        : (currentPage?.slug === 'journal-detail' && currentPage?.sections?.length > 0)
            ? currentPage.sections
            : DEFAULT_DETAIL_SECTIONS;

    return (
        <article className="min-h-screen bg-background pb-32 overflow-x-hidden">
            <main className="w-full flex flex-col pt-0">
                {sections.map((section: any, idx: number) => (
                    <SectionRenderer
                        key={typeof section === 'string' ? `${section}-${idx}` : (section.id || idx)}
                        section={section}
                        instances={instances}
                        currentPage={currentPage}
                        extraData={{ slug }} // Pass the blog slug to the blog_detail section
                    />
                ))}
            </main>
        </article>
    );
}

export default function JournalDetailPage({ params }: { params: any }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <JournalDetailContent params={params} />
        </Suspense>
    );
}
