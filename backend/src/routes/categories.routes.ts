import { Hono } from "hono";
import type { Env, Variables } from "../types/env";
import { getSupabaseAdmin } from "../supabase";
import { adminAuth } from "../middleware/auth";

export const categoriesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/* =======================
   GET all categories (non-deleted)
======================= */
import { getCache, setCache, CACHE_TTL } from "../utils/cache";

/* =======================
   GET all categories (non-deleted)
======================= */
categoriesRoutes.get("/", async (c) => {
  // 1️⃣ Try Cache
  const cached = await getCache(c.env, "categories:list");
  const isAdmin = c.req.path.startsWith("/admin");
  if (cached && !isAdmin) {
    c.header("Cache-Control", "public, s-maxage=3600");
    return c.json({ success: true, data: cached });
  } else if (cached && isAdmin) {
    c.header("Cache-Control", "no-cache, no-store, must-revalidate");
    return c.json({ success: true, data: cached });
  }

  const supabase = c.get("supabase");

  const { data, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      is_active,
      created_at,
      sub_categories:sub_categories(count),
      products:products(count)
    `)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  const formatted = (data || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    is_active: cat.is_active,
    created_at: cat.created_at,
    subcategory_count: cat.sub_categories?.[0]?.count ?? 0,
    product_count: cat.products?.[0]?.count ?? 0,
  }));

  // 2️⃣ Set Cache (Non-blocking)
  c.executionCtx.waitUntil(
    setCache(c.env, "categories:list", formatted, CACHE_TTL.MEDIUM)
  );

  if (!isAdmin) {
    c.header("Cache-Control", "public, s-maxage=3600");
  } else {
    c.header("Cache-Control", "no-cache, no-store, must-revalidate");
  }
  return c.json({ success: true, data: formatted });
});

/* =======================
   CREATE category ✅ FIXED
======================= */
categoriesRoutes.post("/", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const { name } = await c.req.json();

  if (!name) {
    return c.json({ message: "Category name is required" }, 400);
  }

  // ✅ AUTO-GENERATE SLUG
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      is_active: true,
      is_deleted: false,
    })
    .select()
    .single();

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  // Invalidate Cache
  await c.env.CACHE_KV.delete("categories:list");

  return c.json({
    success: true,
    message: "Category created",
    data,
  });
});

/* =======================
   UPDATE category ✅ FIXED
======================= */
categoriesRoutes.put("/:id", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const id = c.req.param("id");
  const { name } = await c.req.json();

  if (!name) {
    return c.json({ message: "Category name is required" }, 400);
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { data, error } = await supabase
    .from("categories")
    .update({ name, slug })
    .eq("id", id)
    .eq("is_deleted", false)
    .select()
    .single();

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  // Invalidate Cache
  await c.env.CACHE_KV.delete("categories:list");

  return c.json({
    success: true,
    message: "Category updated",
    data,
  });
});

/* =======================
   TOGGLE ACTIVE / INACTIVE
======================= */
categoriesRoutes.put("/:id/status", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const id = c.req.param("id");
  const { is_active } = await c.req.json();

  const { error } = await supabase
    .from("categories")
    .update({ is_active })
    .eq("id", id)
    .eq("is_deleted", false);

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  // Cascade disable
  if (is_active === false) {
    await supabase
      .from("sub_categories")
      .update({ is_active: false })
      .eq("category_id", id)
      .eq("is_deleted", false);

    await supabase
      .from("products")
      .update({ is_active: false })
      .eq("category_id", id)
      .eq("is_deleted", false);
  }

  // Invalidate Cache
  await c.env.CACHE_KV.delete("categories:list");

  return c.json({ success: true });
});

/* =======================
   SOFT DELETE category (SAFE)
======================= */
categoriesRoutes.delete("/:id", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const id = c.req.param("id");

  const { count: subCount } = await supabase
    .from("sub_categories")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id)
    .eq("is_deleted", false);

  if ((subCount ?? 0) > 0) {
    return c.json(
      { success: false, message: "Cannot delete category with sub-categories" },
      400
    );
  }

  const { count: prodCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id)
    .eq("is_deleted", false);

  if ((prodCount ?? 0) > 0) {
    return c.json(
      { success: false, message: "Cannot delete category with products" },
      400
    );
  }

  const { error } = await supabase
    .from("categories")
    .update({ is_deleted: true, is_active: false })
    .eq("id", id);

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  // Invalidate Cache
  await c.env.CACHE_KV.delete("categories:list");

  return c.json({
    success: true,
    message: "Category deleted safely",
  });
});
