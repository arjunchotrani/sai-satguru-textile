import { Hono } from "hono";
import type { Env, Variables } from "../types/env";
import { getSupabaseAdmin } from "../supabase";
import { adminAuth } from "../middleware/auth";
import { getCache, setCache, CACHE_TTL, invalidateCachePattern } from "../utils/cache";

export const productsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/* =======================
   🌍 EXPLICIT CACHE CLEAR (DEBUG)
======================= */
productsRoutes.get("/debug/clear-cache", async (c) => {
  await invalidateCachePattern(c.env, "products:list");
  return c.json({ success: true, message: "Cache cleared" });
});

/* =======================
   🌍 GET ALL PRODUCTS (PUBLIC & ADMIN)
   Pagination supported
======================= */
productsRoutes.get("/", async (c) => {
  const page = Number(c.req.query("page") || 1);
  const limit = Number(c.req.query("limit") || 12);
  const search = c.req.query("search") || "";
  const categoryId = c.req.query("category_id") || "";
  const subCategoryId = c.req.query("sub_category_id") || "";
  const brandId = c.req.query("brand") || "";
  const brandType = c.req.query("brand_type") || "";
  const isFeatured = c.req.query("featured") || "";
  const status = c.req.query("status") || "";

  const isAdmin = c.req.path.startsWith("/admin");

  // 1️⃣ Cache Key Generation
  const cacheKey = `products:list:${isAdmin ? 'admin' : 'public'}:${page}:${limit}:${search}:${categoryId}:${subCategoryId}:${brandId}:${brandType}:${isFeatured}:${status}`;

  const cached = await getCache(c.env, cacheKey);
  if (cached && !isAdmin) {
    c.header("Cache-Control", "public, s-maxage=60");
    return c.json(cached);
  } else if (cached && isAdmin) {
    c.header("Cache-Control", "no-cache, no-store, must-revalidate");
    return c.json(cached);
  }

  const supabase = c.get("supabase") || getSupabaseAdmin(c.env);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      category_id,
      sub_category_id,
      brand_id,
      brand_type,
      brand,
      price,
      description,
      is_active,
      created_at,
      product_images (
        image_url,
        is_primary,
        display_order
      ),
      brands (
        name
      )
      `,
      { count: "exact" }
    )
    .eq("is_deleted", status === "archived");

  if (!isAdmin) {
    query = query.eq("is_active", true);
  }

  // 🔹 APPLY FILTERS
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (subCategoryId) {
    query = query.eq("sub_category_id", subCategoryId);
  }

  // Only filter by brand_id if it's a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (brandId && uuidRegex.test(brandId)) {
    query = query.eq("brand_id", brandId);
  } else if (brandId) {
    // If it's a string name (like "EBA LIFESTYLE" or "Generic"), handle it
    if (brandId.toLowerCase() === "generic") {
      query = query.eq("brand_type", "Non-Branded");
    } else {
      // Find the brand ID first because Supabase PostgREST nested table filters
      // require `!inner` join which changes the result structure
      const { data: bData } = await supabase
        .from("brands")
        .select("id")
        .eq("name", brandId)
        .single();

      if (bData?.id) {
        query = query.eq("brand_id", bData.id);
      } else {
        // Force empty result if brand name not found
        query = query.eq("brand_id", "00000000-0000-0000-0000-000000000000");
      }
    }
  }

  if (isFeatured === "true") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("[Products Debug] Supabase Query Error:", error.message);
    return c.json({ success: false, message: error.message }, 500);
  }

  console.log(`[Products Debug] Found ${data?.length || 0} products. Total count: ${count}`);

  // Transform data to include flat images array
  const formattedData = (data || []).map((prod: any) => {
    // Sort images: primary first, then display_order
    const sortedImages = (prod.product_images || []).sort((a: any, b: any) => {
      if (b.is_primary && !a.is_primary) return 1;
      if (!b.is_primary && a.is_primary) return -1;
      return (a.display_order || 0) - (b.display_order || 0) || (a.image_url || "").localeCompare(b.image_url || "");
    });

    return {
      ...prod,
      brand: (prod.brands as any)?.name || prod.brand || "Generic",
      brand_type: prod.brand_type || "Non-Branded",
      images: sortedImages.map((img: any) => img.image_url),
      product_images: undefined, // Clean up
      brands: undefined // Clean up
    };
  });

  const response = {
    success: true,
    data: formattedData,
    total: count,
    page,
    limit,
  };

  // 2️⃣ Set Cache
  c.executionCtx.waitUntil(
    setCache(c.env, cacheKey, response, CACHE_TTL.SHORT)
  );

  if (!isAdmin) {
    c.header("Cache-Control", "public, s-maxage=60");
  } else {
    c.header("Cache-Control", "no-cache, no-store, must-revalidate");
  }
  return c.json(response);
});

/* =======================
   🌍 GET SINGLE PRODUCT (PUBLIC)
======================= */
productsRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const isAdmin = c.req.path.startsWith("/admin");

  // 1️⃣ Cache Key Generation
  const cacheKey = `product:detail:${id}:${isAdmin ? 'admin' : 'public'}`;

  const cached = await getCache(c.env, cacheKey);
  if (cached) {
    console.log(`[KV Cache] HIT: ${cacheKey}`);
    return c.json(cached);
  }
  console.log(`[KV Cache] MISS: ${cacheKey}`);

  const supabase = c.get("supabase") || getSupabaseAdmin(c.env);

  let query = supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      category_id,
      sub_category_id,
      brand_id,
      brand_type,
      brand,
      price,
      description,
      is_active,
      created_at,
      product_images (
        image_url,
        is_primary,
        display_order
      ),
      brands (
        name
      )
      `
    )
    .eq("id", id)
    .eq("is_deleted", false);

  if (!isAdmin) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query.single();

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  // Sort images: primary first, then display_order
  const sortedImages = ((data as any).product_images || []).sort((a: any, b: any) => {
    if (b.is_primary && !a.is_primary) return 1;
    if (!b.is_primary && a.is_primary) return -1;
    return (a.display_order || 0) - (b.display_order || 0) || (a.image_url || "").localeCompare(b.image_url || "");
  });

  const formatted = {
    ...data,
    brand: (data as any).brands?.name || data.brand || null,
    brand_type: data.brand_type || "Non-Branded",
    images: sortedImages.map((img: any) => img.image_url),
    product_images: undefined,
    brands: undefined
  };

  const response = { success: true, data: formatted };

  // 2️⃣ Set Cache (awaiting to ensure local wrangler doesn't drop it)
  await setCache(c.env, cacheKey, response, CACHE_TTL.MEDIUM);

  c.header("Cache-Control", "public, s-maxage=300");
  return c.json(response);
});

/* =======================
   🔐 CREATE PRODUCT
======================= */
productsRoutes.post("/", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);

  const {
    name,
    category_id,
    sub_category_id,
    brand_id,
    brand_type,
    price,
    description,
  } = await c.req.json();

  if (!name || !category_id || price === undefined) {
    return c.json(
      { success: false, message: "Name, category & price are required" },
      400
    );
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      category_id,
      sub_category_id: sub_category_id || null,
      brand_id: brand_id || null,
      brand_type: brand_type || "Non-Branded",
      price,
      description: description || null,
      is_active: true,
      is_deleted: false,
    })
    .select()
    .single();

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  c.executionCtx.waitUntil(Promise.all([
    invalidateCachePattern(c.env, "products:list"),
    invalidateCachePattern(c.env, `product:detail:${data.id}`)
  ]));
  return c.json({ success: true, data });
});

/* =======================
   🔐 UPDATE PRODUCT
======================= */
productsRoutes.put("/:id", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const id = c.req.param("id");

  const {
    name,
    category_id,
    sub_category_id,
    brand_id,
    brand_type,
    price,
    description,
  } = await c.req.json();

  if (!name || !category_id || price === undefined) {
    return c.json(
      { success: false, message: "Name, category & price are required" },
      400
    );
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug,
      category_id,
      sub_category_id: sub_category_id || null,
      brand_id: brand_id || null,
      brand_type: brand_type || "Non-Branded",
      price,
      description: description || null,
    })
    .eq("id", id)
    .eq("is_deleted", false);

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  c.executionCtx.waitUntil(Promise.all([
    invalidateCachePattern(c.env, "products:list"),
    invalidateCachePattern(c.env, `product:detail:${id}`)
  ]));

  return c.json({ success: true });
});

/* =======================
   🔐 TOGGLE VISIBILITY
======================= */
productsRoutes.put("/:id/status", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const id = c.req.param("id");
  const { is_active } = await c.req.json();

  if (typeof is_active !== "boolean") {
    return c.json({ success: false }, 400);
  }

  const { error } = await supabase
    .from("products")
    .update({ is_active })
    .eq("id", id);

  if (error) {
    return c.json({ success: false }, 500);
  }

  c.executionCtx.waitUntil(Promise.all([
    invalidateCachePattern(c.env, "products:list"),
    invalidateCachePattern(c.env, `product:detail:${id}`)
  ]));
  return c.json({ success: true });
});

/* =======================
   🔐 SOFT DELETE PRODUCT
======================= */
productsRoutes.delete("/:id", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const id = c.req.param("id");

  const { error } = await supabase
    .from("products")
    .update({ is_deleted: true, is_active: false })
    .eq("id", id);

  if (error) {
    return c.json({ success: false }, 500);
  }

  c.executionCtx.waitUntil(Promise.all([
    invalidateCachePattern(c.env, "products:list"),
    invalidateCachePattern(c.env, `product:detail:${id}`)
  ]));
  return c.json({ success: true });
});

/* =======================
   🔐 RESTORE PRODUCT
======================= */
productsRoutes.put("/restore/:id", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const id = c.req.param("id");

  const { error } = await supabase
    .from("products")
    .update({ is_deleted: false, is_active: true })
    .eq("id", id);

  if (error) {
    return c.json({ success: false }, 500);
  }

  c.executionCtx.waitUntil(Promise.all([
    invalidateCachePattern(c.env, "products:list"),
    invalidateCachePattern(c.env, `product:detail:${id}`)
  ]));
  return c.json({ success: true });
});


