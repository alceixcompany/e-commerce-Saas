'use client';

import React, { useEffect, use } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import { notFound } from 'next/navigation';
import SectionRenderer from '@/components/SectionRenderer';

export default function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const slug = resolvedParams?.slug || '';

    const pageName = slug.replace(/-/g, ' ');

    const dispatch = useAppDispatch();
    const { currentPage, loading: pageLoading, error, hasLoadedOnce } = useAppSelector((state: any) => state.pages);
    const isLoading = pageLoading.fetchOne;
    const { instances } = useAppSelector((state: any) => state.component);
    const sections = currentPage?.sections || [];

    useEffect(() => {
        if (!slug) return;

        // Diagnostic: Ignore common asset/system paths that might be caught by [slug]
        const assetExtensions = ['.ico', '.png', '.jpg', '.jpeg', '.svg', '.map', '.json', '.js', '.css'];
        const isAsset = assetExtensions.some(ext => slug.toLowerCase().endsWith(ext)) || slug === 'undefined' || slug === 'null';
        
        if (isAsset) {
            console.log(`[SlugGuard] Ignoring asset-like slug: ${slug}`);
            return;
        }

        dispatch(fetchPageBySlug(slug));
    }, [slug, dispatch]);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === `customPage_${slug}`) {
                dispatch(fetchPageBySlug(slug));
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [slug, dispatch]);

    // Sayfa bulunamadıysa 404 ver
    if (hasLoadedOnce && !currentPage && (error || !isLoading)) {
        return notFound();
    }

    if (isLoading || !hasLoadedOnce) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground shrink-0">
            <main>
                <div className="w-full flex flex-col">
                    {sections.map((section: any) => (
                        <SectionRenderer
                            key={typeof section === 'string' ? section : section.id}
                            section={section}
                            instances={instances}
                            currentPage={currentPage}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
