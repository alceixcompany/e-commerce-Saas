'use client';

import React, { useEffect, Suspense } from 'react';
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchLegalSettings } from "@/lib/slices/contentSlice";
import { fetchPageBySlug } from "@/lib/slices/pageSlice";
import SectionRenderer from "@/components/SectionRenderer";
import { PageSection } from '@/types/page';

export default function TermsOfServicePage() {
    const dispatch = useAppDispatch();
    const { termsSettings, loading: contentLoading } = useAppSelector((state) => state.content);
    const isContentLoading = contentLoading.legalSettings;
    const { instances } = useAppSelector((state) => state.component);
    const { currentPage, loading: pageLoading } = useAppSelector((state) => state.pages);
    const isPageLoading = pageLoading.fetchOne;
    const [isInitialized, setIsInitialized] = React.useState(false);

    useEffect(() => {
        const initPage = async () => {
            await Promise.all([
                dispatch(fetchPageBySlug('terms-of-service')),
                dispatch(fetchLegalSettings({ type: 'terms_of_service' }))
            ]);
            setIsInitialized(true);
        };
        initPage();
    }, [dispatch]);

    if (!isInitialized || isContentLoading || isPageLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-foreground/10 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const visibleSections = currentPage?.sections || ['page_hero', 'legal_content'];

    // Fallback data for the legacy legal content if no custom instance is used
    const extraData = {
        legalData: {
            title: termsSettings?.title || 'Terms of Service',
            content: termsSettings?.content || '',
            lastUpdated: termsSettings?.lastUpdated,
            variant: 'standard' as 'standard' | 'compact' | 'boxed'
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-foreground/10 border-t-primary rounded-full animate-spin"></div></div>}>
                {visibleSections.map((section: string | PageSection) => (
                    <SectionRenderer
                        key={typeof section === 'string' ? section : section.id}
                        section={section}
                        instances={instances}
                        currentPage={currentPage}
                        extraData={extraData}
                    />
                ))}
            </Suspense>
        </div>
    );
}
