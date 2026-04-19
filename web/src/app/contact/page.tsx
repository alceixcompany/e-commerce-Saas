import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SectionRenderer from '@/components/SectionRenderer';
import { serverContentService } from '@/lib/server/services/contentService';
import { PageSection } from '@/types/page';

export async function generateMetadata(): Promise<Metadata> {
    const pageData = await serverContentService.getPageBySlug('contact');
    return {
        title: pageData ? `${pageData.title} - Alceix Group` : 'Contact Us - Alceix Group',
        description: pageData?.description || 'Get in touch with Alceix Group for inquiries and support.',
    };
}

export default async function ContactPage({
    searchParams
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const isPreview = resolvedSearchParams?.preview === 'true';
    const pageData = await serverContentService.getPageBySlug('contact', isPreview);

    if (!pageData) {
        return notFound();
    }

    const sections = pageData.sections || [];
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
                {visibleSections.map((section: string | PageSection, idx: number) => (
                    <SectionRenderer
                        key={typeof section === 'string' ? `${section}-${idx}` : (section.id || idx)}
                        section={section}
                        instances={[]}
                        currentPage={pageData}
                    />
                ))}
            </div>
        </div>
    );
}
