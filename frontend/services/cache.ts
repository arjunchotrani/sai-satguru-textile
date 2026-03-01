type CacheEntry<T> = {
    data: T;
    timestamp: number;
};

const cache = new Map<string, CacheEntry<any>>();

// Default TTL: 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

export async function withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = DEFAULT_TTL
): Promise<T> {
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && (now - cached.timestamp < ttl)) {
        return cached.data;
    }

    const data = await fetcher();
    cache.set(key, { data, timestamp: now });
    return data;
}

export function invalidateCache(keyPrefix?: string) {
    if (!keyPrefix) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.startsWith(keyPrefix)) {
            cache.delete(key);
        }
    }
}
