import { Hono } from "hono";
import type { Env, Variables } from "../types/env";
import { getSupabaseAdmin } from "../supabase";
import { adminAuth } from "../middleware/auth";
import { getCache, setCache, CACHE_TTL, invalidateCachePattern } from "../utils/cache";
import { generateUniqueSlug } from "../utils/slug";

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
  const brandId = c.req.query("brand") || c.req.query("brand_id") || "";
  const brandType = c.req.query("brand_type") || "";
  const isFeatured = c.req.query("featured") || "";
  const status = c.req.query("status") || "";
  const sort = c.req.query("sort") || "latest"; // latest, price_asc, price_desc

  const isAdmin = c.req.url.includes("/admin/products");
  const lean = c.req.query("lean") === "true";

  // 1️⃣ Cache Key Generation
  const cacheKey = `products:list:${isAdmin ? 'admin' : 'public'}:${page}:${limit}:${search}:${categoryId}:${subCategoryId}:${brandId}:${brandType}:${isFeatured}:${status}:${sort}:${lean ? "lean" : "full"}`;


  const cached = await getCache(c.env, cacheKey);
  if (cached && !isAdmin) {
    c.header("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return c.json(cached);
  } else if (cached && isAdmin) {
    c.header("Cache-Control", "no-cache, no-store, must-revalidate");
    return c.json(cached);
  }

  const supabase = c.get("supabase") || getSupabaseAdmin(c.env);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const selectFields = lean
    ? `
      id,
      name,
      slug,
      price,
      product_images (
        image_url,
        is_primary,
        display_order
      )
      `
    : `
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
      `;

  let query = supabase
    .from("products")
    .select(selectFields, { count: "exact" })
    .eq("is_deleted", status === "archived");

  if (lean) {
    query = query.limit(2, { foreignTable: 'product_images' });
  }

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
  } else if (sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
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
    c.header("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  } else {
    c.header("Cache-Control", "no-cache, no-store, must-revalidate");
  }
  return c.json(response);
});

/* =======================
   🌍 GET SINGLE PRODUCT BY SLUG (PUBLIC)
======================= */
/* =======================
   🌍 GET SINGLE PRODUCT BY SLUG (PUBLIC)
======================= */
productsRoutes.get("/by-slug/:slug", async (c) => {
  const start = Date.now();
  const slug = c.req.param("slug");
  const isAdmin = c.req.url.includes("/admin/products");

  // detail cache is always full
  const cacheKey = `product:detail:slug:${slug}:${isAdmin ? "admin" : "public"}:full`;
  const cached = await getCache(c.env, cacheKey);
  if (cached) {
    c.header("X-Cache", "HIT");
    return c.json(cached);
  }

  const supabase = c.get("supabase") || getSupabaseAdmin(c.env);
  const queryStart = Date.now();
  
  // Rule 1 & 3: Ensure we have enough data for Above-the-fold and SEO.
  // We ALWAYS use full fields for the detail page.
  const selectFields = `
      id, name, slug, category_id, sub_category_id,
      brand_id, brand_type, brand, price, description,
      product_images (image_url, is_primary, display_order),
      brands (name),
      categories:category_id (name, slug),
      sub_categories:sub_category_id (name, slug)
    `;

  // Attempt 1: Primary lookup using the RAW slug (supports legacy underscores)
  let query = supabase
    .from("products")
    .select(selectFields)
    .eq("slug", slug)
    .eq("is_deleted", false);

  if (!isAdmin) query = query.eq("is_active", true);

  const { data, error } = await query.maybeSingle();
  let finalData = data;

  if (error || !finalData) {
    // Attempt 2: Normalized lookup (supports hyphenated versions of names)
    const normalizedIdentifier = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    
    if (normalizedIdentifier !== slug) {
      let fbQuery1 = supabase
        .from("products")
        .select(selectFields)
        .eq("slug", normalizedIdentifier)
        .eq("is_deleted", false);
      
      if (!isAdmin) fbQuery1 = fbQuery1.eq("is_active", true);
      
      const { data: fallbackData } = await fbQuery1.maybeSingle();
      if (fallbackData) {
          finalData = fallbackData;
      }
    }
    
    // Attempt 3: Loose match by name (if naming is close)
    if (!finalData) {
        const nameGuess = slug.replace(/-/g, " ");
        let fbQuery2 = supabase
            .from("products")
            .select(selectFields)
            .ilike("name", `%${nameGuess}%`)
            .eq("is_deleted", false);
            
        if (!isAdmin) fbQuery2 = fbQuery2.eq("is_active", true);
            
        const { data: nameMatch } = await fbQuery2.maybeSingle();
        if (nameMatch) {
            finalData = nameMatch;
        } else {
            return c.json({ success: false, message: "Product not found" }, 404);
        }
    }
  }

  const queryDuration = Date.now() - queryStart;
  const serializationStart = Date.now();

  const brandNameField = (finalData as any).brands?.name || (finalData as any).brand || null;

  // Sort images: primary first, then display_order
  let sortedImages = (
    (finalData as any).product_images || []
  ).sort((a: any, b: any) => {
    if (b.is_primary && !a.is_primary) return 1;
    if (!b.is_primary && a.is_primary) return -1;
    return (a.display_order || 0) - (b.display_order || 0);
  });

  const formatted = {
    ...(finalData as any),
    brand: brandNameField,
    brand_type: (finalData as any).brand_type || "Non-Branded",
    basePriceINR: (finalData as any).price,
    brandName: brandNameField,
    brandSlug: null,
    images: sortedImages.map((img: any) => img.image_url),
    categoryId: (finalData as any).category_id,
    subCategoryId: (finalData as any).sub_category_id,

    // Joined data for front-end breadcrumbs
    category: (finalData as any).categories ? { 
        name: (finalData as any).categories.name, 
        slug: (finalData as any).categories.slug,
        label: (finalData as any).categories.label || (finalData as any).categories.name 
    } : null,
    subCategory: (finalData as any).sub_categories ? { 
        name: (finalData as any).sub_categories.name, 
        slug: (finalData as any).sub_categories.slug,
        label: (finalData as any).sub_categories.label || (finalData as any).sub_categories.name 
    } : null,
    product_images: undefined,
    brands: undefined,
    categories: undefined,
    sub_categories: undefined
  };

  const response = { success: true, data: formatted };
  const serializationDuration = Date.now() - serializationStart;

  console.log(`[Performance Audit] /by-slug/${slug} | T-Total: ${Date.now() - start}ms | T-Query: ${queryDuration}ms | T-Serial: ${serializationDuration}ms`);

  await setCache(c.env, cacheKey, response, CACHE_TTL.MEDIUM);
  c.header("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return c.json(response);
});





/* =======================
   🌍 GET SINGLE PRODUCT (PUBLIC)
======================= */
productsRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const isAdmin = c.req.url.includes("/admin/products");

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

  if (error || !data) {
    return c.json(
      { success: false, message: "Product not found" }, 
      404
    );
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

  c.header("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
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
    brand,
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

  const finalSlug = await generateUniqueSlug(supabase, name, "products");

  // Resolve brand_id if missing but brand name provided
  let resolvedBrandId = brand_id;
  if (!resolvedBrandId && brand && brand.toLowerCase() !== "generic") {
    const { data: bData } = await supabase
      .from("brands")
      .select("id")
      .eq("name", brand)
      .single();
    if (bData?.id) resolvedBrandId = bData.id;
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug: finalSlug,
      category_id,
      sub_category_id: sub_category_id || null,
      brand_id: resolvedBrandId || null,
      brand: brand || "Generic",
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
    brand,
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

  // Resolve brand_id if missing but brand name provided
  let resolvedBrandId = brand_id;
  if (!resolvedBrandId && brand && brand.toLowerCase() !== "generic") {
    const { data: bData } = await supabase
      .from("brands")
      .select("id")
      .eq("name", brand)
      .single();
    if (bData?.id) resolvedBrandId = bData.id;
  }

  const { error } = await supabase
    .from("products")
    .update({
      name,
      category_id,
      sub_category_id: sub_category_id || null,
      brand_id: resolvedBrandId || null,
      brand: brand || "Generic",
      brand_type: brand_type || "Non-Branded",
      price,
      description: description || null,
      // NOTE: We EXPLICITLY do not update the 'slug' here to prevent breaking 
      // existing indexed URLs in Google Search Console.
    })
    .eq("id", id)
    .eq("is_deleted", false);

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  // Fetch slug for cache invalidation
  const { data: pData } = await supabase.from("products").select("slug").eq("id", id).single();

  c.executionCtx.waitUntil(Promise.all([
    invalidateCachePattern(c.env, "products:list"),
    invalidateCachePattern(c.env, `product:detail:${id}`),
    pData?.slug ? invalidateCachePattern(c.env, `product:detail:slug:${pData.slug}`) : Promise.resolve()
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

  // Fetch slug for cache invalidation
  const { data: pData } = await supabase.from("products").select("slug").eq("id", id).single();

  c.executionCtx.waitUntil(Promise.all([
    invalidateCachePattern(c.env, "products:list"),
    invalidateCachePattern(c.env, `product:detail:${id}`),
    pData?.slug ? invalidateCachePattern(c.env, `product:detail:slug:${pData.slug}`) : Promise.resolve()
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

  // Fetch slug for cache invalidation
  const { data: pData } = await supabase.from("products").select("slug").eq("id", id).single();

  c.executionCtx.waitUntil(Promise.all([
    invalidateCachePattern(c.env, "products:list"),
    invalidateCachePattern(c.env, `product:detail:${id}`),
    pData?.slug ? invalidateCachePattern(c.env, `product:detail:slug:${pData.slug}`) : Promise.resolve()
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


