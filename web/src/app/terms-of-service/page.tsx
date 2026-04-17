import React, { Suspense } from 'react';
import { Metadata } from 'next';
import SectionRenderer from "@/components/SectionRenderer";
import { serverContentService } from "@/lib/server/services/contentService";
import { PageSection } from '@/types/page';
import * as Sections from '@/types/sections';

export async function generateMetadata(): Promise<Metadata> {
    const legalData = await serverContentService.getLegalSettings('terms_of_service');
    return {
        title: legalData?.title || 'Terms of Service - Alceix Group',
        description: 'Read the terms of service of Alceix Group.',
    };
}

export default async function TermsOfServicePage() {
    // Parallel fetch: Page structure and Legal Content
    const [currentPage, termsSettings] = await Promise.all([
        serverContentService.getPageBySlug('terms-of-service'),
        serverContentService.getLegalSettings('terms_of_service')
    ]);

    const visibleSections = currentPage?.sections || ['page_hero', 'legal_content'];

    // Data for the legal content section
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
                {visibleSections.map((section: string | PageSection, idx: number) => (
                    <SectionRenderer
                        key={typeof section === 'string' ? `${section}-${idx}` : (section.id || idx)}
                        section={section}
                        instances={[]}
                        currentPage={currentPage}
                        extraData={extraData}
                    />
                ))}
            </Suspense>
        </div>
    );
}
