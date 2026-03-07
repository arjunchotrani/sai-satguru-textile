import { Hono } from "hono";
import type { Env, Variables } from "../types/env";
import { getSupabaseAdmin } from "../supabase";
import { adminAuth } from "../middleware/auth";

export const subcategoriesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/* =======================
   GET all sub-categories
   (count ONLY non-deleted products)
======================= */
import { getCache, setCache, CACHE_TTL } from "../utils/cache";

/* =======================
   GET all sub-categories
   (count ONLY non-deleted products)
======================= */
subcategoriesRoutes.get("/", async (c) => {
  // 1️⃣ Try Cache
  const cached = await getCache(c.env, "subcategories:list");
  const isAdmin = c.req.url.includes("/admin/subcategories");
  if (cached && !isAdmin) {
    c.header("Cache-Control", "public, s-maxage=3600");
    return c.json({ success: true, data: cached });
  } else if (cached && isAdmin) {
    c.header("Cache-Control", "no-cache, no-store, must-revalidate");
    return c.json({ success: true, data: cached });
  }

  const supabase = c.get("supabase");

  const { data, error } = await supabase
    .from("sub_categories")
    .select(`
      id,
      name,
      slug,
      category_id,
      is_active,
      created_at,
      display_order,
      products:products(count)
    `)
    .eq("is_deleted", false)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  const formatted = (data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    category_id: s.category_id,
    is_active: s.is_active,
    created_at: s.created_at,
    display_order: s.display_order || 0,
    product_count: s.products?.[0]?.count ?? 0,
  }));

  // 2️⃣ Set Cache (Non-blocking)
  c.executionCtx.waitUntil(
    setCache(c.env, "subcategories:list", formatted, CACHE_TTL.MEDIUM)
  );

  if (!isAdmin) {
    c.header("Cache-Control", "public, s-maxage=3600");
  } else {
    c.header("Cache-Control", "no-cache, no-store, must-revalidate");
  }
  return c.json({ success: true, data: formatted });
});

/* =======================
   CREATE sub-category
======================= */
subcategoriesRoutes.post("/", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const { name, category_id, display_order } = await c.req.json();

  if (!name || !category_id) {
    return c.json(
      { success: false, message: "Name and category are required" },
      400
    );
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { data, error } = await supabase
    .from("sub_categories")
    .insert({
      name,
      slug,
      category_id,
      display_order: display_order || 0,
      is_active: true,
      is_deleted: false,
    })
    .select()
    .single();

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  // Invalidate Cache
  await c.env.CACHE_KV.delete("subcategories:list");

  return c.json({
    success: true,
    message: "Sub-category created",
    data,
  });
});

/* =======================
   UPDATE sub-category
======================= */
subcategoriesRoutes.put("/:id", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const id = c.req.param("id");
  const { name, category_id, display_order } = await c.req.json();

  if (!name || !category_id) {
    return c.json(
      { success: false, message: "Name and category are required" },
      400
    );
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { data, error } = await supabase
    .from("sub_categories")
    .update({ name, slug, category_id, display_order: display_order ?? 0 })
    .eq("id", id)
    .eq("is_deleted", false)
    .select()
    .single();

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  // Invalidate Cache
  await c.env.CACHE_KV.delete("subcategories:list");

  return c.json({
    success: true,
    message: "Sub-category updated",
    data,
  });
});

/* =======================
   TOGGLE ACTIVE / INACTIVE
======================= */
subcategoriesRoutes.put("/:id/status", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const id = c.req.param("id");
  const { is_active } = await c.req.json();

  if (typeof is_active !== "boolean") {
    return c.json({ message: "Invalid status" }, 400);
  }

  const { error } = await supabase
    .from("sub_categories")
    .update({ is_active })
    .eq("id", id)
    .eq("is_deleted", false);

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  // Invalidate Cache
  await c.env.CACHE_KV.delete("subcategories:list");

  return c.json({ success: true });
});

/* =======================
   SOFT DELETE sub-category
   (BLOCK only if ACTIVE products exist)
======================= */
subcategoriesRoutes.delete("/:id", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const id = c.req.param("id");

  // 🔒 Block delete ONLY if ACTIVE products exist
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("sub_category_id", id)
    .eq("is_deleted", false)
    .eq("is_active", true);

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  if ((count ?? 0) > 0) {
    return c.json(
      {
        success: false,
        message:
          "Deactivate or remove active products under this sub-category first",
      },
      400
    );
  }

  const { error: delError } = await supabase
    .from("sub_categories")
    .update({ is_deleted: true, is_active: false })
    .eq("id", id);

  if (delError) {
    return c.json({ success: false, message: delError.message }, 500);
  }

  // Invalidate Cache
  await c.env.CACHE_KV.delete("subcategories:list");

  return c.json({ success: true, message: "Sub-category removed" });
});
