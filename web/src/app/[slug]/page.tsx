'use client';

import React, { useEffect, use, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import { notFound, useSearchParams } from 'next/navigation';
import SectionRenderer from '@/components/SectionRenderer';

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

    const pageName = slug.replace(/-/g, ' ');

    const dispatch = useAppDispatch();
    const { currentPage, loading: pageLoading, error, hasLoadedOnce } = useAppSelector((state: any) => state.pages);
    const isLoading = pageLoading.fetchOne;
    const { instances } = useAppSelector((state: any) => state.component);
    const sections = currentPage?.sections || [];
    const searchParams = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';
    const [forceNotFound, setForceNotFound] = useState(false);

    const negativeCacheKey = useMemo(() => `slug404_${slug}`, [slug]);

    useEffect(() => {
        if (!slug) return;

        // Diagnostic: Ignore common asset/system paths that might be caught by [slug]
        const assetExtensions = ['.ico', '.png', '.jpg', '.jpeg', '.svg', '.map', '.json', '.js', '.css'];
        const isAsset = assetExtensions.some(ext => slug.toLowerCase().endsWith(ext)) || slug === 'undefined' || slug === 'null';
        
        if (isAsset || isScannerSlug(slug)) {
            // Don't let probes trigger expensive data fetches.
            setForceNotFound(true);
            return;
        }

        // Preview must stay live; never negative-cache it.
        if (!isPreview) {
            try {
                const raw = localStorage.getItem(negativeCacheKey);
                if (raw) {
                    const cachedAt = Number(raw);
                    if (Number.isFinite(cachedAt) && Date.now() - cachedAt < NEGATIVE_CACHE_TTL_MS) {
                        setForceNotFound(true);
                        return;
                    }
                    localStorage.removeItem(negativeCacheKey);
                }
            } catch {
                // Ignore storage errors (private mode, disabled storage, etc.)
            }
        }

        dispatch(fetchPageBySlug(slug));
    }, [slug, dispatch, isPreview, negativeCacheKey]);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === `customPage_${slug}`) {
                dispatch(fetchPageBySlug(slug));
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [slug, dispatch]);

    if (forceNotFound && !isPreview) {
        return notFound();
    }

    // Sayfa bulunamadıysa 404 ver
    if (hasLoadedOnce && !currentPage && (error || !isLoading)) {
        if (!isPreview) {
            try {
                localStorage.setItem(negativeCacheKey, String(Date.now()));
            } catch {
                // Ignore
            }
        }
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
