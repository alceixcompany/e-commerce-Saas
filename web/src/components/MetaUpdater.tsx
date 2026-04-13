'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { fetchGlobalSettings } from '@/lib/slices/contentSlice';

export default function MetaUpdater() {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { globalSettings } = useAppSelector((state) => state.content);

    useEffect(() => {
        // Skip for admin pages to preserve admin dashboard titles
        if (pathname?.startsWith('/admin')) return;

        // 1. Update Document Title (Browser Tab)
        const titleToUse = globalSettings.metaTitle || globalSettings.siteName;
        if (titleToUse) {
            document.title = titleToUse;
        }

        // 2. Update Meta Description
        updateMetaTag('description', globalSettings.metaDescription);

        // 3. Update OG Tags (for social sharing)
        updateMetaProperty('og:title', titleToUse);
        updateMetaProperty('og:description', globalSettings.metaDescription);
        updateMetaProperty('og:site_name', globalSettings.siteName);

    }, [globalSettings.metaTitle, globalSettings.metaDescription, globalSettings.siteName, pathname]);

    // Helper to update or create <meta name="...">
    const updateMetaTag = (name: string, content: string | undefined) => {
        if (!content) return;
        let element = document.querySelector(`meta[name='${name}']`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('name', name);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    // Helper to update or create <meta property="..."> (for OG tags)
    const updateMetaProperty = (property: string, content: string | undefined) => {
        if (!content) return;
        let element = document.querySelector(`meta[property='${property}']`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    return null;
}
