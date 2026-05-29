import type { Env } from "../types/env";

export const CACHE_TTL = {
    SHORT: 300,    // 5 minutes
    MEDIUM: 3600,  // 1 hour
    LONG: 86400,   // 24 hours
};

const CACHE_BASE_URL = "https://cache.internal/";

export async function getCache<T>(
    _env: Env,
    key: string
): Promise<T | null> {
    try {
        const cache = caches.default;
        const response = await cache.match(CACHE_BASE_URL + encodeURIComponent(key));
        if (response) {
            return await response.json() as T;
        }
    } catch (error) {
        console.warn(`[Cache] Error reading key ${key}:`, error);
    }
    return null;
}

export async function setCache(
    _env: Env,
    key: string,
    value: any,
    ttlSeconds: number = CACHE_TTL.SHORT
) {
    try {
        const cache = caches.default;
        const response = new Response(JSON.stringify(value), {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": `public, max-age=${ttlSeconds}`,
            },
        });
        await cache.put(CACHE_BASE_URL + encodeURIComponent(key), response);
    } catch (error) {
        console.warn(`[Cache] Error writing key ${key}:`, error);
    }
}

export async function invalidateCachePattern(_env: Env, prefix: string) {
    try {
        const cache = caches.default;

        if (prefix.startsWith("product:detail:slug:")) {
            const slug = prefix.replace("product:detail:slug:", "");
            await Promise.all([
                cache.delete(CACHE_BASE_URL + encodeURIComponent(`product:detail:slug:${slug}:public:full`)),
                cache.delete(CACHE_BASE_URL + encodeURIComponent(`product:detail:slug:${slug}:admin:full`)),
            ]);
        } else if (prefix.startsWith("product:detail:")) {
            const id = prefix.replace("product:detail:", "");
            await Promise.all([
                cache.delete(CACHE_BASE_URL + encodeURIComponent(`product:detail:${id}:public`)),
                cache.delete(CACHE_BASE_URL + encodeURIComponent(`product:detail:${id}:admin`)),
            ]);
        }
        // products:list entries expire via their 5-min TTL — Cache API cannot enumerate keys
    } catch (error) {
        console.warn(`[Cache] Error invalidating prefix ${prefix}:`, error);
    }
}
