import { Hono } from "hono";
import type { Env, Variables } from "../types/env";
import { getSupabaseAdmin } from "../supabase";
import { adminAuth } from "../middleware/auth";

export const brandsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/* =======================
   GET all brands
======================= */
brandsRoutes.get("/", async (c) => {
    const supabase = getSupabaseAdmin(c.env);

    const { data, error } = await supabase
        .from("brands")
        .select("id, name")
        .order("name", { ascending: true });

    if (error) {
        return c.json({ success: false, message: error.message }, 500);
    }

    return c.json({ success: true, data });
});

/* =======================
   CREATE brand
======================= */
brandsRoutes.post("/", adminAuth, async (c) => {
    const supabase = getSupabaseAdmin(c.env);
    const { name } = await c.req.json();

    if (!name) {
        return c.json({ success: false, message: "Brand name is required" }, 400);
    }

    const { data, error } = await supabase
        .from("brands")
        .insert({ name })
        .select()
        .single();

    if (error) {
        return c.json({ success: false, message: error.message }, 500);
    }

    return c.json({ success: true, data });
});

/* =======================
   UPDATE brand
======================= */
brandsRoutes.put("/:id", adminAuth, async (c) => {
    const supabase = getSupabaseAdmin(c.env);
    const id = c.req.param("id");
    const { name } = await c.req.json();

    if (!name) {
        return c.json({ success: false, message: "Brand name is required" }, 400);
    }

    const { data, error } = await supabase
        .from("brands")
        .update({ name })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return c.json({ success: false, message: error.message }, 500);
    }

    return c.json({ success: true, data });
});

/* =======================
   DELETE brand
======================= */
brandsRoutes.delete("/:id", adminAuth, async (c) => {
    const supabase = getSupabaseAdmin(c.env);
    const id = c.req.param("id");

    // Logic: Block delete if any product uses this brand
    const { count, error: countError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("brand_id", id)
        .eq("is_deleted", false);

    if (countError) {
        return c.json({ success: false, message: countError.message }, 500);
    }

    if ((count ?? 0) > 0) {
        return c.json(
            { success: false, message: "Cannot delete brand that is being used by products" },
            400
        );
    }

    const { error } = await supabase
        .from("brands")
        .delete()
        .eq("id", id);

    if (error) {
        return c.json({ success: false, message: error.message }, 500);
    }

    return c.json({ success: true, message: "Brand deleted" });
});

/* =======================
   GET single brand (by ID or Slug)
======================= */
brandsRoutes.get("/:identifier", async (c) => {
    const identifier = c.req.param("identifier");
    const supabase = getSupabaseAdmin(c.env);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    let query = supabase.from("brands").select("*");

    if (uuidRegex.test(identifier)) {
        query = query.eq("id", identifier);
    } else {
        // We don't have a slug column, so we search by name (replacing hyphens with spaces for a loose match)
        const nameGuess = identifier.replace(/-/g, " ");
        query = query.ilike("name", `%${nameGuess}%`);
    }

    const { data, error } = await query.single();

    if (error || !data) {
        // Fallback: search all and find best slug match in JS if single query fails
        const { data: allBrands } = await supabase.from("brands").select("id, name");
        const found = (allBrands || []).find(b => 
            b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") === identifier
        );
        
        if (found) return c.json({ success: true, data: found });
        return c.json({ success: false, message: "Brand not found" }, 404);
    }

    return c.json({ success: true, data });
});

