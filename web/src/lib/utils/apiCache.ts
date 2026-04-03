export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Generic utility to fetch data with localStorage caching and TTL validation.
 * @param key Unique key for localStorage
 * @param fetchFn Callback to fetch data from API
 * @param ttlMinutes Time to Live in minutes (how long cache stays valid)
 * @returns Cached data if valid, otherwise fresh API data
 */
export const fetchWithCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMinutes: number = 15,
  forceRefresh: boolean = false
): Promise<T> => {
  const isClient = typeof window !== 'undefined';
  const cacheKey = `alceix_cache_${key}`;
  const ttlMs = ttlMinutes * 60 * 1000;

  // 1. Try to return valid cached data (unless forceRefresh is true)
  if (isClient && !forceRefresh) {
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cachedItem: CacheItem<T> = JSON.parse(cachedStr);
        const ageInMs = Date.now() - cachedItem.timestamp;
        
        // --- SWR STRATEGY ---
        // If the cache is still fresh, return it instantly
        if (ageInMs < ttlMs) {
          return cachedItem.data;
        }

        // If the cache is stale but exists, return it instantly BUT revalidate in background
        if (ageInMs >= ttlMs) {
          // Fire and forget background revalidation
          fetchFn().then(freshData => {
            if (freshData !== null && freshData !== undefined) {
               const newItem: CacheItem<T> = { data: freshData, timestamp: Date.now() };
               localStorage.setItem(cacheKey, JSON.stringify(newItem));
            }
          }).catch(err => console.warn(`Background revalidation failed for ${key}`, err));

          return cachedItem.data;
        }
      }
    } catch (e) {
      console.warn(`Failed to parse cache for ${key}`, e);
    }
  }

  // 2. Fetch fresh data because cache is missing or forceRefresh is true
  const data = await fetchFn();

  // 3. Save to cache if on client and data is valid
  if (isClient && data !== null && data !== undefined) {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (e) {
      console.warn(`Failed to set cache for ${key} (might be full)`, e);
    }
  }

  return data;
};
