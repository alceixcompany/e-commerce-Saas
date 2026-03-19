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
  ttlMinutes: number = 15
): Promise<T> => {
  const isClient = typeof window !== 'undefined';
  const cacheKey = `alceix_cache_${key}`;
  const ttlMs = ttlMinutes * 60 * 1000;

  // 1. Try to return valid cached data
  if (isClient) {
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cachedItem: CacheItem<T> = JSON.parse(cachedStr);
        const ageInMs = Date.now() - cachedItem.timestamp;
        
        // If the cache is still fresh, return it instantly
        if (ageInMs < ttlMs) {
          return cachedItem.data;
        }
      }
    } catch (e) {
      console.warn(`Failed to parse cache for ${key}`, e);
      // Suppress error, just fetch fresh data
    }
  }

  // 2. Fetch fresh data because cache is missing, stale, or server-side
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
