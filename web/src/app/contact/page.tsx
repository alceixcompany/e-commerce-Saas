'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useEffect } from 'react';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';

// Dynamic components
import SectionRenderer from '@/components/SectionRenderer';
import { PageSection } from '@/types/page';

export default function ContactPage() {
    const dispatch = useAppDispatch();
    const { currentPage, loading: pageLoading } = useAppSelector((state) => state.pages);
    const isLoading = pageLoading.fetchOne;
    const { instances } = useAppSelector((state) => state.component);

    useEffect(() => {
        dispatch(fetchPageBySlug('contact'));
    }, [dispatch]);

    if (isLoading || !currentPage) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-foreground/10 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const sections = currentPage.sections || [];
    const visibleSections = sections.filter((s: string | PageSection) => {
        if (typeof s === 'string') return true;
        return s.isActive !== false;
    });

    if (visibleSections.length === 0) {
        return null;
    }

    return (
        <div className="bg-background min-h-screen font-sans selection:bg-primary/30">
            <div className="w-full flex flex-col">
                {visibleSections.map((section: string | PageSection) => (
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
