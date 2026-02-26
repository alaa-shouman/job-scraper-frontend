export const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now(), key });
}

export function deleteCache(key: string): void {
  store.delete(key);
}

export function clearCache(): void {
  store.clear();
}

/** Returns seconds remaining, or 0 if not cached / expired. */
export function cacheExpiresIn(key: string): number {
  const entry = store.get(key);
  if (!entry) return 0;
  const remaining = CACHE_TTL_MS - (Date.now() - entry.timestamp);
  if (remaining <= 0) {
    store.delete(key);
    return 0;
  }
  return Math.ceil(remaining / 1000);
}

export function isCached(key: string): boolean {
  return cacheExpiresIn(key) > 0;
}

/** Stable cache key built from a jobs request body. */
export function buildJobsCacheKey(params: Record<string, unknown>): string {
  return `jobs:${JSON.stringify(params, Object.keys(params).sort())}`;
}
