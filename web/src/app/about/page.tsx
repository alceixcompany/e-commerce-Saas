import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SectionRenderer from '@/components/SectionRenderer';
import { serverContentService } from '@/lib/server/services/contentService';
import { PageSection } from '@/types/page';
import * as Sections from '@/types/sections';

export async function generateMetadata(): Promise<Metadata> {
    const pageData = await serverContentService.getPageBySlug('about');
    return {
        title: pageData ? `${pageData.title} - Alceix Group` : 'About Us - Alceix Group',
        description: pageData?.description || 'Learn more about Alceix Group and our heritage.',
    };
}

export default async function AboutPage() {
    const pageData = await serverContentService.getPageBySlug('about');

    if (!pageData) {
        return notFound();
    }

    type RenderableSection = string | (PageSection & { instanceData?: Sections.SectionData });
    const sections: RenderableSection[] = (pageData.sections || []) as RenderableSection[];
    const visibleSections = sections.filter((s) => (typeof s === 'string' ? true : s.isActive !== false));

    if (visibleSections.length === 0) {
        return null;
    }

    return (
        <div className="bg-background min-h-screen font-sans selection:bg-primary/30">
            <div className="w-full flex flex-col">
                {visibleSections.map((section, idx) => (
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
