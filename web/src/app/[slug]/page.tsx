import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SectionRenderer from '@/components/SectionRenderer';
import { serverContentService } from '@/lib/server/services/contentService';
import { isScannerSlug } from '@/lib/server/utils/scannerProtection';
import { PageSection } from '@/types/page';
import * as Sections from '@/types/sections';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    if (isScannerSlug(slug)) {
        return { title: 'Not Found' };
    }

    const pageData = await serverContentService.getPageBySlug(slug);

    if (!pageData) {
        return { title: 'Page Not Found - Alceix Group' };
    }

    return {
        title: `${pageData.title} - Alceix Group`,
        description: pageData.description || `Explore our ${pageData.title} page.`,
    };
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // 1. Scanner Protection (Server Side)
    if (isScannerSlug(slug)) {
        return notFound();
    }

    // 2. Fetch Data (RSC)
    const pageData = await serverContentService.getPageBySlug(slug);

    // 3. 404 Handling (Native Next.js)
    if (!pageData) {
        return notFound();
    }

    type RenderableSection = string | (PageSection & { instanceData?: Sections.SectionData });
    const sections: RenderableSection[] = (pageData.sections || []) as RenderableSection[];

    return (
        <div className="min-h-screen bg-background text-foreground shrink-0">
            <main>
                <div className="w-full flex flex-col">
                    {sections.map((section, idx) => (
                        <SectionRenderer
                            key={typeof section === 'string' ? `${section}-${idx}` : (section.id || idx)}
                            section={section}
                            instances={[]} // RSC fetching handles instances via page structure
                            currentPage={pageData}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
