import type { Env } from "../types/env";

export const CACHE_TTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
};

export async function getCache<T>(
    env: Env,
    key: string
): Promise<T | null> {
    try {
        const data = await env.CACHE_KV.get(key, "json");
        if (data) {
            console.log(`[KV Cache] HIT: ${key}`);
            return data as T;
        }
    } catch (error) {
        console.warn(`[KV Cache] Error reading key ${key}:`, error);
    }
    return null;
}

export async function setCache(
    env: Env,
    key: string,
    value: any,
    ttlSeconds: number = CACHE_TTL.SHORT
) {
    try {
        await env.CACHE_KV.put(key, JSON.stringify(value), {
            expirationTtl: ttlSeconds,
        });
        console.log(`[KV Cache] SET: ${key}`);
    } catch (error) {
        console.warn(`[KV Cache] Error writing key ${key}:`, error);
    }
}

export async function invalidateCachePattern(env: Env, prefix: string) {
    // KV list operations are eventually consistent and might be slow
    // Use with caution or specific keys
    try {
        const list = await env.CACHE_KV.list({ prefix });
        const keys = list.keys.map((k) => k.name);
        // Batch delete is not directly supported in standard workers types simply
        // but we can Promise.all
        await Promise.all(keys.map((key) => env.CACHE_KV.delete(key)));
        console.log(`[KV Cache] Invalidated ${keys.length} keys for prefix: ${prefix}`);
    } catch (error) {
        console.warn(`[KV Cache] Error invalidating prefix ${prefix}:`, error);
    }
}
