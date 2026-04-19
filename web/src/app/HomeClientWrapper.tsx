'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCmsStore } from '@/lib/store/useCmsStore';
import SectionRenderer from '@/components/SectionRenderer';
import { PageSection, CustomPage } from '@/types/page';

interface HomeClientWrapperProps {
    currentPage: CustomPage;
}

export default function HomeClientWrapper({ currentPage: serverPage }: HomeClientWrapperProps) {
    const searchParams = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';
    const { currentPage: cmsPage, instances, fetchPageBySlug, isLoading } = useCmsStore();
    
    // If preview mode is requested, fetch the latest draft/live data bypassing SSR cache
    useEffect(() => {
        if (isPreview) {
            fetchPageBySlug('home');
        }
    }, [fetchPageBySlug, isPreview]);

    // Use CmsStore state only if we're in preview mode and it's done loading
    const isFetchingPreview = isPreview && isLoading;
    const activePage = (isPreview && cmsPage && cmsPage.slug === 'home') ? cmsPage : serverPage;

    if (isFetchingPreview) {
        return (
            <div className="min-h-screen flex items-center justify-center">
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!activePage) return null;

    const sections = activePage.sections || [];
    const visibleSections = sections.filter((s: string | PageSection) => {
        if (typeof s === 'string') return true;
        return s.isActive !== false;
    });

    return (
        <div className="w-full flex flex-col">
            {visibleSections.map((section: string | PageSection) => (
                <SectionRenderer
                    key={typeof section === 'string' ? section : section.id}
                    section={section}
                    instances={instances}
                    currentPage={activePage}
                />
            ))}
        </div>
    );
}
