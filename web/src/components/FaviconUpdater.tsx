'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';

export default function FaviconUpdater() {
    const { globalSettings } = useAppSelector((state) => state.content);

    useEffect(() => {
        if (globalSettings.favicon) {
            const links = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");

            if (links.length > 0) {
                links.forEach((link) => {
                    (link as HTMLLinkElement).href = globalSettings.favicon;
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
