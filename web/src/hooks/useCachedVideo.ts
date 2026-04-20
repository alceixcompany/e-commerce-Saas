'use client';

import { useState, useEffect } from 'react';

const inflightVideoRequests = new Map<string, Promise<Blob>>();

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
      setCachedUrl(undefined);
      setIsCaching(false);
      setError(null);
      return;
    }

    const loadVideo = async () => {
      try {
        setIsCaching(true);
        setError(null);
        if (typeof caches === 'undefined') {
          throw new Error('Cache API not supported');
        }
        const cacheName = 'alceix-hero-video-cache-v1';
        const cache = await caches.open(cacheName);

        let response = await cache.match(videoUrl);

        let blob: Blob;

        if (!response) {
          let inflightRequest = inflightVideoRequests.get(videoUrl);
          if (!inflightRequest) {
            inflightRequest = (async () => {
              const networkResponse = await fetch(videoUrl);
              if (!networkResponse.ok) {
                throw new Error('Network response was not ok.');
              }

              await cache.put(videoUrl, networkResponse.clone());
              return networkResponse.blob();
            })();
            inflightVideoRequests.set(videoUrl, inflightRequest);
          }

          blob = await inflightRequest;
        } else {
          blob = await response.blob();
        }

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
      } finally {
        inflightVideoRequests.delete(videoUrl);
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
