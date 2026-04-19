import React, { Suspense } from 'react';
import { Metadata } from 'next';
import SectionRenderer from "@/components/SectionRenderer";
import { serverContentService } from "@/lib/server/services/contentService";
import { PageSection } from '@/types/page';

export async function generateMetadata(): Promise<Metadata> {
    const legalData = await serverContentService.getLegalSettings('privacy_policy');
    return {
        title: legalData?.title || 'Privacy Policy - Alceix Group',
        description: 'Read the privacy policy of Alceix Group.',
    };
}

export default async function PrivacyPolicyPage({
    searchParams
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const isPreview = resolvedSearchParams?.preview === 'true';
    // Parallel fetch: Page structure and Legal Content
    const [currentPage, privacySettings] = await Promise.all([
        serverContentService.getPageBySlug('privacy-policy', isPreview),
        serverContentService.getLegalSettings('privacy_policy', isPreview)
    ]);

    const visibleSections = currentPage?.sections || ['page_hero', 'legal_content'];

    // Data for the legal content section
    const extraData = {
        legalData: {
            title: privacySettings?.title || 'Privacy Policy',
            content: privacySettings?.content || '',
            lastUpdated: privacySettings?.lastUpdated,
            variant: 'compact' as 'standard' | 'compact' | 'boxed'
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
