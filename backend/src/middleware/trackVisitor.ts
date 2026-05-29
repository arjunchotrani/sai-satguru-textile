import { createClient } from "@supabase/supabase-js";
import type { Env } from "../types/env";

export async function trackVisitor(request: Request, env: Env) {
    try {
        if (request.url.includes("/admin")) return;

        const urlPath = new URL(request.url).pathname;
        if (urlPath !== "/products") return;

        if (request.headers.get("CF-Bot-Score") === "1") return;

        const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
        const ua = request.headers.get("User-Agent") || "unknown";
        const today = new Date().toISOString().split("T")[0];
        const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip + ua + today));
        const visitorHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        // upsert with ignoreDuplicates = silent no-op if hash already counted today
        await supabase
            .from("visitor_sessions")
            .upsert({ hash: visitorHash, date: today }, { onConflict: "hash", ignoreDuplicates: true });
    } catch (err) {
        console.warn("Visitor tracking failed", err);
    }
}
