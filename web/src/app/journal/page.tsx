import React from 'react';
import { Metadata } from 'next';
import SectionRenderer from '@/components/SectionRenderer';
import { PageSection } from '@/types/page';
import { serverBlogService } from '@/lib/server/services/blogService';
import { serverContentService } from '@/lib/server/services/contentService';

export const metadata: Metadata = {
    title: 'Journal - Alceix Group',
    description: 'Explore our latest stories, artisan perspectives, and jewelry design heritage.'
};

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ preview?: string; q?: string; sort?: string; page?: string }> }) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.q || '';
    const sort = resolvedSearchParams.sort || 'all';
    const page = Number(resolvedSearchParams.page) || 1;

    // Fetch data in parallel on the server
    const [pageData, blogRes] = await Promise.all([
        serverContentService.getPageBySlug('journal'),
        serverBlogService.getPublicBlogs({ q: query, sort, page, limit: 10 })
    ]);

    const sections = (pageData?.slug === 'journal' && pageData?.sections?.length > 0)
        ? pageData.sections
        : ['blog_list'];

    return (
        <div className="min-h-screen bg-background pt-[90px] md:pt-[120px] pb-16 md:pb-32 overflow-x-hidden">
            <main className="w-full flex flex-col">
                {sections.map((section: string | PageSection, idx: number) => (
                    <SectionRenderer
                        key={typeof section === 'string' ? `${section}-${idx}` : (section.id || idx)}
                        section={section}
                        instances={[]} // RSC doesn't use client-side instances by default
                        currentPage={pageData}
                        extraData={{
                            blogs: blogRes.data,
                            blogMetadata: blogRes.metadata
                        }}
                    />
                ))}
            </main>
        </div>
    );
}
