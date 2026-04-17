import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SectionRenderer from '@/components/SectionRenderer';
import { serverContentService } from '@/lib/server/services/contentService';
import { serverCategoryService } from '@/lib/server/services/categoryService';
import { serverProductService } from '@/lib/server/services/productService';
import { PageSection } from '@/types/page';

export async function generateMetadata(): Promise<Metadata> {
    const pageData = await serverContentService.getPageBySlug('categories');
    return {
        title: pageData ? `${pageData.title} - Alceix Group` : 'Categories - Alceix Group',
        description: pageData?.description || 'Browse our collections by category.',
    };
}

export default async function CategoriesPage() {
    // Parallel fetch: Page structure, Public Categories, and Featured Products
    const [pageData, categoriesRes, productsRes] = await Promise.all([
        serverContentService.getPageBySlug('categories'),
        serverCategoryService.getPublicCategories(),
        serverProductService.getPublicProducts({ limit: 12 })
    ]);

    // UI Fallback if no page structure is defined in CMS
    if (!pageData || !pageData.sections || pageData.sections.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-background font-sans">
                <div className="max-w-7xl mx-auto px-6 py-12 text-center">
                    <h1 className="text-4xl font-light tracking-[0.1em] uppercase text-foreground mb-4">Categories</h1>
                    <p className="text-foreground/50 mb-8 italic">This page is currently empty. Add components from the admin dashboard.</p>
                    <Link href="/" className="inline-block px-8 py-3 bg-foreground text-background text-xs uppercase tracking-widest font-bold hover:bg-primary transition-colors">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans pt-16">
            {pageData.sections.map((section: PageSection | string, idx: number) => (
                <SectionRenderer
                    key={typeof section === 'string' ? `${section}-${idx}` : (section.id || idx)}
                    section={section}
                    instances={[]}
                    currentPage={pageData}
                    extraData={{
                        // Pass categories and products in case any sub-component needs them
                        // e.g. a category grid or featured scroller on the categories page
                        blogs: [], // Empty or fetch as well if needed
                        relatedProducts: productsRes.data
                    }}
                />
            ))}
        </div>
    );
}
