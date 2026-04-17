import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SectionRenderer from '@/components/SectionRenderer';
import { serverContentService } from '@/lib/server/services/contentService';
import { serverCategoryService } from '@/lib/server/services/categoryService';
import { serverProductService } from '@/lib/server/services/productService';
import { PageSection } from '@/types/page';

export async function generateMetadata(): Promise<Metadata> {
    const pageData = await serverContentService.getPageBySlug('categories');
    return {
        title: pageData ? `${pageData.title} - Alceix Group` : 'Collections - Alceix Group Catalog',
        description: pageData?.description || 'Explore our exclusive collections of jewelry and accessories.',
    };
}

export default async function CollectionsPage() {
    // Parallel data loading
    const [pageData, categories, productsRes] = await Promise.all([
        serverContentService.getPageBySlug('categories'),
        serverCategoryService.getPublicCategories(),
        serverProductService.getPublicProducts({ limit: 12 })
    ]);

    // Fallback if no sections are defined yet
    if (!pageData || !pageData.sections || pageData.sections.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-background font-sans">
                <div className="max-w-7xl mx-auto px-6 py-12 text-center">
                    <h1 className="text-4xl font-light tracking-[0.1em] uppercase text-foreground mb-4">Collections</h1>
                    <p className="text-foreground/50 mb-8 italic">Explore our various collections and find your perfect piece.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans pt-16">
            {pageData.sections.filter((s): s is PageSection => typeof s !== 'string').map((section, idx) => (
                <SectionRenderer
                    key={section.id || idx}
                    section={section}
                    instances={[]} // RSC pre-fetches instance data inside page structure
                    currentPage={pageData}
                    extraData={{
                        // Provide context for components like CategoryGrid or FeaturedSlider
                        categories: categories.data,
                        relatedProducts: productsRes.data
                    }}
                />
            ))}
        </div>
    );
}
