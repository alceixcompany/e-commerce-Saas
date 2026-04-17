import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryClient from './CategoryClient';
import { serverCategoryService } from '@/lib/server/services/categoryService';
import { serverProductService } from '@/lib/server/services/productService';
import type { Category } from '@/types/category';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const specialCategories: Record<string, string> = {
        'new-arrivals': 'New Arrivals',
        'best-sellers': 'Best Sellers'
    };

    if (specialCategories[slug]) {
        return {
            title: `${specialCategories[slug]} - Alceix Group`,
            description: `Browse our ${specialCategories[slug]} collection.`
        };
    }

    const category = await serverCategoryService.getCategoryBySlug(slug);
    if (!category) return { title: 'Category Not Found - Alceix Group' };

    return {
        title: `${category.name} - Alceix Group`,
        description: category.description || `Explore our ${category.name} collection.`,
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const isSpecial = ['new-arrivals', 'best-sellers'].includes(slug);
    let categoryData: any = null;
    let productsRes: any = null;

    if (isSpecial) {
        const specialDetails: Record<string, any> = {
            'new-arrivals': {
                _id: 'new-arrivals',
                name: 'New Arrivals',
                slug: 'new-arrivals',
                description: 'Discover our latest Alceix treasures, fresh from the atelier.',
                image: '/image/alceix/product.png'
            },
            'best-sellers': {
                _id: 'best-sellers',
                name: 'Best Sellers',
                slug: 'best-sellers',
                description: 'Our most coveted Alceix pieces, loved by collectors worldwide.',
                image: '/image/alceix/hero.png'
            }
        };
        categoryData = specialDetails[slug];
        productsRes = await serverProductService.getPublicProducts({
            tag: slug === 'new-arrivals' ? 'new-arrival' : 'best-seller',
            limit: 10,
            page: 1,
            sort: 'newest'
        });
    } else {
        categoryData = await serverCategoryService.getCategoryBySlug(slug);
        if (!categoryData) return notFound();

        productsRes = await serverProductService.getPublicProducts({
            category: categoryData._id,
            limit: 10,
            page: 1,
            sort: 'newest'
        });
    }

    return (
        <CategoryClient
            slug={slug}
            initialCategory={categoryData}
            initialProducts={productsRes.data}
            initialMetadata={productsRes.metadata}
        />
    );
}
