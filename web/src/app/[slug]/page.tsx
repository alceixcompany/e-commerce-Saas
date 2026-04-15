'use client';

import React, { useEffect, use, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import { notFound, useSearchParams } from 'next/navigation';
import SectionRenderer from '@/components/SectionRenderer';
import type { PageSection } from '@/types/page';
import * as Sections from '@/types/sections';

const NEGATIVE_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function isScannerSlug(slug: string) {
    const s = slug.toLowerCase();
    if (s === '.env' || s === '.git' || s === 'wp-admin' || s === 'wp-login.php' || s === 'xmlrpc.php') return true;
    if (s.includes('phpmyadmin') || s.includes('cgi-bin')) return true;
    return false;
}

export default function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const slug = resolvedParams?.slug || '';

    const [forceNotFound, setForceNotFound] = useState(false);

    const dispatch = useAppDispatch();
    const { currentPage, loading: pageLoading, error, hasLoadedOnce } = useAppSelector((state) => state.pages);
    const isLoading = pageLoading.fetchOne;
    const { instances } = useAppSelector((state) => state.component);
    type RenderableSection = string | (PageSection & { instanceData?: Sections.SectionData });
    const sections: RenderableSection[] = (currentPage?.sections || []) as RenderableSection[];
    const searchParams = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';

    const negativeCacheKey = useMemo(() => `slug404_${slug}`, [slug]);
    const shouldNotFound = hasLoadedOnce && !currentPage && (error || !isLoading) && !isPreview;
    const isBlockedSlug = useMemo(() => {
        if (!slug) return false;
        const s = slug.toLowerCase();
        const assetExtensions = ['.ico', '.png', '.jpg', '.jpeg', '.svg', '.map', '.json', '.js', '.css'];
        const isAsset = assetExtensions.some((ext) => s.endsWith(ext)) || s === 'undefined' || s === 'null';
        return isAsset || isScannerSlug(s);
    }, [slug]);

    // Negative Cache Check
    useEffect(() => {
        if (!slug || isBlockedSlug || isPreview) return;

        try {
            const raw = localStorage.getItem(negativeCacheKey);
            if (raw) {
                const cachedAt = Number(raw);
                if (Number.isFinite(cachedAt) && Date.now() - cachedAt < NEGATIVE_CACHE_TTL_MS) {
                    Promise.resolve().then(() => setForceNotFound(true));
                    return;
                }
                localStorage.removeItem(negativeCacheKey);
            }
        } catch { /* ignore */ }
    }, [slug, negativeCacheKey, isBlockedSlug, isPreview]);

    // Data Fetching
    useEffect(() => {
        if (!slug || isBlockedSlug || forceNotFound) return;
        dispatch(fetchPageBySlug(slug));
    }, [slug, dispatch, isBlockedSlug, forceNotFound]);

    useEffect(() => {
        if (!shouldNotFound) return;
        try {
            localStorage.setItem(negativeCacheKey, String(Date.now()));
        } catch {
            // Ignore storage errors
        }
    }, [shouldNotFound, negativeCacheKey]);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === `customPage_${slug}`) {
                dispatch(fetchPageBySlug(slug));
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [slug, dispatch]);

    if (isBlockedSlug && !isPreview) {
        return notFound();
    }

    // Sayfa bulunamadıysa 404 ver
    if (forceNotFound || (hasLoadedOnce && !currentPage && (error || !isLoading))) {
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
                    {sections.map((section) => (
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
