'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { fetchGlobalSettings } from '@/lib/slices/contentSlice';

export default function FaviconUpdater() {
    const dispatch = useAppDispatch();
    const { globalSettings } = useAppSelector((state) => state.content);

    useEffect(() => {
        dispatch(fetchGlobalSettings());
    }, [dispatch]);

    useEffect(() => {
        if (globalSettings.favicon) {
            const links = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");

            if (links.length > 0) {
                links.forEach((link: any) => {
                    link.href = globalSettings.favicon;
                });
            } else {
                // Create if not exists
                const newLink = document.createElement('link');
                newLink.rel = 'icon';
                newLink.href = globalSettings.favicon;
                document.head.appendChild(newLink);
            }
        }
    }, [globalSettings.favicon]);

    return null;
}
