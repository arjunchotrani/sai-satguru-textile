import type { Env } from "../types/env";

export async function trackVisitor(request: Request, env: Env) {
    try {
        // ❌ Skip admin panel requests
        if (request.url.includes("/admin")) return;

        // ✅ Only count on /products endpoint (called once per page load)
        const urlPath = new URL(request.url).pathname;
        if (urlPath !== "/products") return;

        // ❌ Skip bots (basic protection)
        if (request.headers.get("CF-Bot-Score") === "1") return;

        // 🔒 Dedup: only count each visitor once per day
        const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
        const ua = request.headers.get("User-Agent") || "unknown";
        const today = new Date().toISOString().split("T")[0];
        const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip + ua + today));
        const visitorHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

        // Check if this visitor was already counted today
        const dedupKey = `visit:daily:${visitorHash}`;
        const alreadyCounted = await env.CACHE_KV.get(dedupKey);
        if (alreadyCounted) return;

        // ✅ Mark as counted for 24 hours
        await env.CACHE_KV.put(dedupKey, "1", { expirationTtl: 86400 });

        const totalVisitorsKey = `visitors:total`;
        const dailyKey = `visitors:daily:${today}`;

        // ✅ Increment TOTAL VISITOR COUNT
        const currentTotal = (await env.CACHE_KV.get(totalVisitorsKey)) || "0";
        await env.CACHE_KV.put(totalVisitorsKey, (parseInt(currentTotal) + 1).toString());

        // ✅ Increment DAILY VISITOR COUNT (auto-expires in 24h)
        const currentDaily = (await env.CACHE_KV.get(dailyKey)) || "0";
        await env.CACHE_KV.put(dailyKey, (parseInt(currentDaily) + 1).toString(), { expirationTtl: 86400 });
    } catch (err) {
        // Fail silently - analytics should never block
        console.warn("Visitor tracking failed", err);
    }
}
