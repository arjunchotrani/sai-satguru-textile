import { Hono } from "hono";
import type { Env, Variables } from "../types/env";
import { getSupabaseAdmin } from "../supabase";
import { adminAuth } from "../middleware/auth";
import { uploadToR2, deleteFromR2 } from "../utils/r2";
import { invalidateCachePattern } from "../utils/cache";

export const productImagesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/* ======================================================
   🌍 PUBLIC – GET IMAGES BY PRODUCT (NO AUTH)
   URL: /product-images?product_id=UUID
   Used by WEBSITE
====================================================== */
productImagesRoutes.get("/", async (c) => {
  const product_id = c.req.query("product_id");

  if (!product_id) {
    return c.json(
      { success: false, message: "product_id required" },
      400
    );
  }

  const supabase = getSupabaseAdmin(c.env);

  const { data, error } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", product_id)
    .order("is_primary", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("PUBLIC product images error:", error);
    return c.json({ success: false }, 500);
  }

  return c.json({
    success: true,
    data: data.map((i) => i.image_url),
  });
});

/* ======================================================
   🔐 ADMIN – GET ALL IMAGES
   URL: /admin/product-images/:product_id
====================================================== */
productImagesRoutes.get("/:product_id", async (c) => {
  const product_id = c.req.param("product_id");
  const supabase = getSupabaseAdmin(c.env);

  const { data, error } = await supabase
    .from("product_images")
    .select("id, image_url, is_primary, display_order")
    .eq("product_id", product_id)
    .order("is_primary", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("ADMIN product images error:", error);
    return c.json({ success: false }, 500);
  }

  // ✅ SANITIZATION: Force only one primary image per product in response
  // This unblocks the "Set Primary" UI button for corrupted rows
  let primaryFound = false;
  const sanitizedData = data.map((img: any) => {
    if (img.is_primary) {
      if (primaryFound) img.is_primary = false;
      else primaryFound = true;
    }
    return img;
  });

  return c.json({ success: true, data: sanitizedData });
});

/* ======================================================
   🔐 ADMIN – UPLOAD IMAGE (AUTO PRIMARY)
====================================================== */
/* ======================================================
   🔐 ADMIN – GET PRESIGNED URL (For Direct Upload)
====================================================== */
productImagesRoutes.post("/presigned-url", adminAuth, async (c) => {
  const { product_id, file_name, file_type } = await c.req.json();

  if (!product_id || !file_name || !file_type) {
    return c.json({ success: false, message: "Missing required fields" }, 400);
  }

  // 🛡️ SECURITY: Enforce Image MIME Types Only
  if (!file_type.startsWith("image/")) {
    return c.json({ success: false, message: "Only images are allowed" }, 400);
  }

  // 🛡️ SECURITY: Sanitize Extension and Use UUID (Block Path Traversal & XSS Payloads)
  const extension = file_name.split('.').pop()?.substring(0, 10).replace(/[^a-zA-Z0-9]/g, "") || "jpeg";
  const safeFilename = `${crypto.randomUUID()}.${extension}`;
  const key = `products/${product_id}/${Date.now()}-${safeFilename}`;

  // Import dynamically or ensure it's exported from r2.ts
  const { getUploadUrl } = await import("../utils/r2");
  const { uploadUrl, publicUrl } = await getUploadUrl(key, file_type, c.env);

  return c.json({ success: true, uploadUrl, publicUrl, key });
});

/* ======================================================
   🔐 ADMIN – LINK UPLOADED IMAGE (OR UPLOAD DIRECTLY)
====================================================== */
productImagesRoutes.post("/", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);

  // Try JSON first (New Flow)
  let product_id: string | null = null;
  let image_url: string | null = null;
  let is_primary = false;

  const contentType = c.req.header("Content-Type") || "";

  if (contentType.includes("application/json")) {
    const body = await c.req.json();
    product_id = body.product_id;
    image_url = body.image_url; // Expecting full public URL or key? Let's expect publicURL or full path
    is_primary = typeof body.is_primary === 'boolean' ? body.is_primary : false;
  } else {
    // Old Flow (FormData)
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    product_id = formData.get("product_id") as string | null;
    is_primary = formData.get("is_primary") === "true";

    if (file && product_id) {
      if (!file.type.startsWith("image/")) {
        return c.json({ success: false, message: "Only images are allowed" }, 400);
      }
      const extension = file.name.split('.').pop()?.substring(0, 10).replace(/[^a-zA-Z0-9]/g, "") || "jpeg";
      const safeFilename = `${crypto.randomUUID()}.${extension}`;
      const key = `products/${product_id}/${Date.now()}-${safeFilename}`;
      image_url = await uploadToR2(file, key, c.env);
    }
  }

  if (!product_id || !image_url) {
    return c.json({ success: false, message: "Invalid payload" }, 400);
  }

  // ✅ Insert safely without querying existing primaries to avoid TOCTOU race conditions
  const { error } = await supabase.from("product_images").insert({
    product_id,
    image_url,
    is_primary,
  });

  if (error) {
    console.error("Link image error:", error);
    return c.json({ success: false, message: error.message }, 500);
  }

  c.executionCtx.waitUntil(Promise.all([
    invalidateCachePattern(c.env, "products:list"),
    invalidateCachePattern(c.env, `product:detail:${product_id}`)
  ]));

  return c.json({ success: true }, 201);
});

/* ======================================================
   🔐 ADMIN – SET PRIMARY IMAGE
====================================================== */
productImagesRoutes.put("/:id/set-primary", adminAuth, async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabaseAdmin(c.env);

  const { data } = await supabase
    .from("product_images")
    .select("product_id")
    .eq("id", id)
    .single();

  if (!data) {
    return c.json({ success: false }, 404);
  }

  // 1. Reset all OTHER images
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", data.product_id)
    .neq("id", id);

  // 2. Set selected image
  await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", id);

  c.executionCtx.waitUntil(Promise.all([
    invalidateCachePattern(c.env, "products:list"),
    invalidateCachePattern(c.env, `product:detail:${data.product_id}`)
  ]));

  return c.json({ success: true });
});

/* ======================================================
   🔐 ADMIN – REORDER IMAGES
   URL: /admin/product-images/reorder
   Description: Sets the first image as primary and updates others.
====================================================== */
productImagesRoutes.put("/reorder", adminAuth, async (c) => {
  const { product_id, image_ids } = await c.req.json();
  const supabase = getSupabaseAdmin(c.env);

  if (!product_id || !image_ids || !Array.isArray(image_ids)) {
    return c.json({ success: false, message: "Invalid payload" }, 400);
  }

  // 1. Reset all images for this product explicitly
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", product_id);

  // 2. Set the order and primary flags (sequential to prevent race conditions)
  for (let i = 0; i < image_ids.length; i++) {
    await supabase
      .from("product_images")
      .update({
        is_primary: i === 0,
        display_order: i
      })
      .eq("id", image_ids[i])
      .eq("product_id", product_id); // Safety check
  }

  c.executionCtx.waitUntil(Promise.all([
    invalidateCachePattern(c.env, "products:list"),
    invalidateCachePattern(c.env, `product:detail:${product_id}`)
  ]));

  return c.json({ success: true, message: "Order updated" });
});

/* ======================================================
   🔐 ADMIN – DELETE IMAGE
====================================================== */
productImagesRoutes.delete("/:id", adminAuth, async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabaseAdmin(c.env);

  const { data } = await supabase
    .from("product_images")
    .select("image_url, product_id, is_primary")
    .eq("id", id)
    .single();

  if (!data) {
    return c.json({ success: false }, 404);
  }

  // Delete from R2
  const key = data.image_url.replace(
    `${c.env.R2_PUBLIC_URL}/`,
    ""
  );
  await deleteFromR2(key, c.env);

  // Delete from DB
  await supabase.from("product_images").delete().eq("id", id);

  // 🛡️ If primary deleted → auto-assign another image
  if (data.is_primary) {
    const { data: nextImage } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", data.product_id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextImage) {
      await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", nextImage.id);
    }
  }

  c.executionCtx.waitUntil(Promise.all([
    invalidateCachePattern(c.env, "products:list"),
    invalidateCachePattern(c.env, `product:detail:${data.product_id}`)
  ]));

  return c.json({ success: true });
});
