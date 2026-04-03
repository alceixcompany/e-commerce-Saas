'use client';

import React, { useEffect, useState, use } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchComponentInstances } from '@/lib/slices/componentSlice';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import { notFound } from 'next/navigation';
import SectionRenderer from '@/components/SectionRenderer';

export default function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
    // Next.js 15+ sürümlerinde params artık bir Promise olarak gelir, use() ile okuyoruz
    const resolvedParams = use(params);
    const slug = resolvedParams?.slug || '';
    
    // Slug üzerinden sayfa adını türetelim
    const pageName = slug.replace(/-/g, ' ');

    const dispatch = useAppDispatch();
    const { currentPage, isLoading, error, hasLoadedOnce } = useAppSelector((state: any) => state.pages);
    const { instances } = useAppSelector((state: any) => state.component);
    const sections = currentPage?.sections || [];

    useEffect(() => {
        if (slug) {
            dispatch(fetchPageBySlug(slug));
        }
    }, [slug, dispatch]);

    // iframe içindeki localStorage'ı parent window'dan güncelleyince storage event tetiklenir
    // Admin panelindeki önizleme (Live Preview) için hala storage event'ini dinleyebiliriz 
    // veya admin panelinin kaydetme işlemi sonrası API'den tekrar çekmesini sağlayabiliriz.
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === `customPage_${slug}`) {
                // Önizleme için anlık güncelleme gerekirse tekrar çek
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
