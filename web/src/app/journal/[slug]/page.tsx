import React from 'react';
import { Metadata } from 'next';
import SectionRenderer from '@/components/SectionRenderer';
import { serverBlogService } from '@/lib/server/services/blogService';
import { serverContentService } from '@/lib/server/services/contentService';
import { PageSection, CustomPage } from '@/types/page';
import { Blog } from '@/types/blog';
import * as Sections from '@/types/sections';

type JournalParams = { slug: string };

type RenderableSection = string | (PageSection & { instanceData?: Sections.SectionData });
const DEFAULT_DETAIL_SECTIONS: RenderableSection[] = [
    { 
        id: 'blog_detail', 
        label: 'Journal Detail', 
        description: 'Journal article content',
        isActive: true, 
        hasSettings: true,
        instanceData: {} as Sections.SectionData 
    }
];

export async function generateMetadata({ params }: { params: Promise<JournalParams> }): Promise<Metadata> {
    const resolvedParams = await params;
    const blog = await serverBlogService.getBlogBySlug(resolvedParams.slug);

    if (!blog) {
        return {
            title: 'Journal - Alceix Group',
            description: 'Explore our latest stories and jewelry design heritage.'
        };
    }

    return {
        title: `${blog.title} - Journal`,
        description: blog.excerpt || blog.title,
        openGraph: {
            title: blog.title,
            description: blog.excerpt,
            images: blog.image ? [{ url: blog.image }] : [],
            type: 'article',
            publishedTime: blog.publishedAt || blog.createdAt,
        }
    };
}

export default async function JournalDetailPage({ params, searchParams }: { 
    params: Promise<JournalParams>, 
    searchParams: Promise<{ preview?: string }> 
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const isPreview = resolvedSearchParams.preview === 'true';
    const slug = resolvedParams.slug;

    // Parallel fetch blog post and page structure
    const [blog, pageData] = await Promise.all([
        serverBlogService.getBlogBySlug(slug),
        serverContentService.getPageBySlug('journal-detail')
    ]);

    // Fallback if no specific CMS layout is found
    const sections = (pageData?.slug === 'journal-detail' && pageData?.sections?.length > 0)
        ? pageData.sections
        : DEFAULT_DETAIL_SECTIONS;

    return (
        <article className="min-h-screen bg-background pb-32 overflow-x-hidden">
            <main className="w-full flex flex-col pt-0">
                {(sections as RenderableSection[]).map((section, idx: number) => (
                    <SectionRenderer
                        key={typeof section === 'string' ? `${section}-${idx}` : (section.id || idx)}
                        section={section}
                        instances={[]} // RSC uses server data, client instances are secondary
                        currentPage={pageData}
                        extraData={{ 
                            slug, 
                            blog: blog as Blog,
                            // Pass preview flag to downstream clients if needed
                        }}
                    />
                ))}
            </main>
        </article>
    );
}
