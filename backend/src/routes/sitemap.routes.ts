import { Hono } from "hono";
import type { Env, Variables } from "../types/env";
import { getSupabaseAdmin } from "../supabase";
import { getCache, setCache, CACHE_TTL } from "../utils/cache";

const DOMAIN = "https://saisatgurutextile.com";
const SITEMAP_CACHE_TTL = CACHE_TTL.LONG; // 1 hour

export const sitemapRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/* =====================================================
   Helper: XML response with correct Content-Type
===================================================== */
function xmlResponse(xml: string): Response {
    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, s-maxage=3600",
        },
    });
}

/* =====================================================
   Helper: Format date to YYYY-MM-DD for <lastmod>
===================================================== */
function formatDate(dateStr?: string | null): string {
    if (!dateStr) return new Date().toISOString().split("T")[0];
    return new Date(dateStr).toISOString().split("T")[0];
}

/* =====================================================
   Helper: Generate slug from name
===================================================== */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/* =====================================================
   /sitemap.xml → Sitemap Index
===================================================== */
sitemapRoutes.get("/sitemap.xml", (c) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${DOMAIN}/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${DOMAIN}/sitemap-products.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${DOMAIN}/sitemap-brands.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${DOMAIN}/sitemap-categories.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${DOMAIN}/sitemap-subcategories.xml</loc>
  </sitemap>
</sitemapindex>`;

    return xmlResponse(xml);
});

/* =====================================================
   /sitemap-pages.xml → Static Pages
===================================================== */
sitemapRoutes.get("/sitemap-pages.xml", (c) => {
    const fixedDate = "2026-03-01"; // Fixed date to prevent redundant indexing

    const pages = [
        { path: "/", lastmod: fixedDate, changefreq: "daily", priority: "1.0" },
        { path: "/about", lastmod: fixedDate, changefreq: "monthly", priority: "0.5" },
        { path: "/contact", lastmod: fixedDate, changefreq: "monthly", priority: "0.5" },
        { path: "/new-arrivals", lastmod: fixedDate, changefreq: "daily", priority: "0.8" },
        { path: "/brands", lastmod: fixedDate, changefreq: "daily", priority: "0.7" },
    ];

    const urls = pages
        .map(
            (p) => `  <url>
    <loc>${DOMAIN}${p.path}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
        )
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return xmlResponse(xml);
});

/* =====================================================
   /sitemap-products.xml → Product Detail Pages
   Supports thousands of products via pagination
===================================================== */
sitemapRoutes.get("/sitemap-products.xml", async (c) => {
    // 1️⃣ Try KV cache
    const cacheKey = "sitemap:products";
    const cached = await getCache<string>(c.env, cacheKey);
    if (cached) return xmlResponse(cached);

    // 2️⃣ Fetch all active products in batches
    const supabase = getSupabaseAdmin(c.env);
    const allProducts: { slug: string; created_at: string }[] = [];
    const PAGE_SIZE = 1000;
    let from = 0;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from("products")
            .select("slug, created_at")
            .eq("is_active", true)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false })
            .range(from, from + PAGE_SIZE - 1);

        if (error) {
            console.error("[Sitemap] Products fetch error:", error.message);
            break;
        }

        if (data && data.length > 0) {
            allProducts.push(...data);
            from += PAGE_SIZE;
            hasMore = data.length === PAGE_SIZE;
        } else {
            hasMore = false;
        }
    }

    // 3️⃣ Build XML
    const urls = allProducts
        .map(
            (p) => `  <url>
    <loc>${DOMAIN}/product/${p.slug}</loc>
    <lastmod>${formatDate(p.created_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
        )
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    // 4️⃣ Cache for 1 hour (non-blocking)
    if (c.executionCtx && typeof c.executionCtx.waitUntil === "function") {
        c.executionCtx.waitUntil(setCache(c.env, cacheKey, xml, SITEMAP_CACHE_TTL));
    } else {
        setCache(c.env, cacheKey, xml, SITEMAP_CACHE_TTL).catch(console.error);
    }

    return xmlResponse(xml);
});

/* =====================================================
   /sitemap-brands.xml → Brand Pages
===================================================== */
sitemapRoutes.get("/sitemap-brands.xml", async (c) => {
    const cacheKey = "sitemap:brands";
    const cached = await getCache<string>(c.env, cacheKey);
    if (cached) return xmlResponse(cached);

    const supabase = getSupabaseAdmin(c.env);

    const { data, error } = await supabase
        .from("brands")
        .select("name")
        .order("name", { ascending: true });

    if (error) {
        console.error("[Sitemap] Brands fetch error:", error.message);
        return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`);
    }

    const today = new Date().toISOString().split("T")[0];

    const urls = (data || [])
        .map(
            (b) => `  <url>
    <loc>${DOMAIN}/brand/${generateSlug(b.name)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
        )
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    if (c.executionCtx && typeof c.executionCtx.waitUntil === "function") {
        c.executionCtx.waitUntil(setCache(c.env, cacheKey, xml, SITEMAP_CACHE_TTL));
    } else {
        setCache(c.env, cacheKey, xml, SITEMAP_CACHE_TTL).catch(console.error);
    }

    return xmlResponse(xml);
});

/* =====================================================
   /sitemap-categories.xml → Category Pages
===================================================== */
sitemapRoutes.get("/sitemap-categories.xml", async (c) => {
    const cacheKey = "sitemap:categories";
    const cached = await getCache<string>(c.env, cacheKey);
    if (cached) return xmlResponse(cached);

    const supabase = getSupabaseAdmin(c.env);

    const { data, error } = await supabase
        .from("categories")
        .select("slug, created_at")
        .eq("is_active", true)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[Sitemap] Categories fetch error:", error.message);
        return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`);
    }

    const urls = (data || [])
        .map(
            (cat) => `  <url>
    <loc>${DOMAIN}/category/${cat.slug}</loc>
    <lastmod>${formatDate(cat.created_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
        )
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    if (c.executionCtx && typeof c.executionCtx.waitUntil === "function") {
        c.executionCtx.waitUntil(setCache(c.env, cacheKey, xml, SITEMAP_CACHE_TTL));
    } else {
        setCache(c.env, cacheKey, xml, SITEMAP_CACHE_TTL).catch(console.error);
    }

    return xmlResponse(xml);
});

/* =====================================================
   /sitemap-subcategories.xml → Subcategory Pages
===================================================== */
sitemapRoutes.get("/sitemap-subcategories.xml", async (c) => {
    const cacheKey = "sitemap:subcategories";
    const cached = await getCache<string>(c.env, cacheKey);
    if (cached) return xmlResponse(cached);

    const supabase = getSupabaseAdmin(c.env);

    const { data, error } = await supabase
        .from("sub_categories")
        .select("slug, created_at, parent_category:categories(slug)")
        .eq("is_active", true)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[Sitemap] Subcategories fetch error:", error.message);
        return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`);
    }

    const urls = (data || [])
        .map(
            (p: any) => `  <url>
    <loc>${DOMAIN}/category/${p.parent_category?.slug}/${p.slug}</loc>
    <lastmod>${formatDate(p.created_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
        )
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    if (c.executionCtx && typeof c.executionCtx.waitUntil === "function") {
        c.executionCtx.waitUntil(setCache(c.env, cacheKey, xml, SITEMAP_CACHE_TTL));
    } else {
        setCache(c.env, cacheKey, xml, SITEMAP_CACHE_TTL).catch(console.error);
    }

    return xmlResponse(xml);
});
