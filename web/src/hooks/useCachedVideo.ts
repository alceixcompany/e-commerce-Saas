'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to cache video files using the browser's Cache API.
 * This ensures large video files (which exceed localStorage limits)
 * are stored in the disk cache for 0ms network delay on reload.
 */
export const useCachedVideo = (videoUrl: string | undefined) => {
  const [cachedUrl, setCachedUrl] = useState<string | undefined>(undefined);
  const [isCaching, setIsCaching] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let urlToRevoke: string | null = null;

    if (!videoUrl) {
      setIsCaching(false);
      return;
    }

    const loadVideo = async () => {
      try {
        setIsCaching(true);
        // Use the native Browser Cache API
        const cacheName = 'alceix-hero-video-cache-v1';
        const cache = await caches.open(cacheName);
        
        let response = await cache.match(videoUrl);
        
        if (!response) {
          // If not in cache, fetch and store
          response = await fetch(videoUrl);
          if (response.ok) {
            await cache.put(videoUrl, response.clone());
          } else {
             throw new Error('Network response was not ok.');
          }
        }
        
        const blob = await response.blob();
        
        if (isMounted) {
            const objectUrl = URL.createObjectURL(blob);
            urlToRevoke = objectUrl;
            setCachedUrl(objectUrl);
            setIsCaching(false);
        }
      } catch (err) {
        console.error('Failed to cache video, falling back to network url:', err);
        if (isMounted) {
            // Fallback to streaming original URL directly if cache logic fails
            setCachedUrl(videoUrl);
            setIsCaching(false);
            setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    loadVideo();

    return () => {
      isMounted = false;
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, [videoUrl]);

  return { cachedUrl, isCaching, error };
};
