import { Hono } from "hono";
import type { Env, Variables } from "../types/env";
import { adminAuth } from "../middleware/auth";
import { getSupabaseAdmin } from "../supabase";

export const enquiriesRoutes = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

/* =====================================================
   🌐 PUBLIC – WEBSITE ENQUIRY (NO AUTH)
   POST /enquiries
   ===================================================== */
enquiriesRoutes.post("/", async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ success: false, message: "Invalid JSON body" }, 400);
  }
  const { name, phone, message, product_id, source } = body;

  if (!name || !phone || !message) {
    return c.json(
      { success: false, message: "Name, phone and message are required" },
      400
    );
  }

  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      name,
      phone,
      message,
      product_id: product_id ?? null,
      source: source || "Website",
      status: "New",
      is_converted: false,
    });

  if (error) {
    console.error("Enquiry Error:", error);
    return c.json({ success: false, message: error.message }, 500);
  }

  return c.json({
    success: true,
    message: "Enquiry submitted successfully",
  });
});

/* =====================================================
   🔐 ADMIN – GET ALL ENQUIRIES
   GET /enquiries
   ===================================================== */
enquiriesRoutes.get("/", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);

  const { data, error } = await supabase
    .from("enquiries")
    .select("id, name, phone, status, is_converted, created_at, source")
    .order("created_at", { ascending: false });

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  return c.json({ success: true, data });
});

/* =====================================================
   🔐 ADMIN – GET SINGLE ENQUIRY
   GET /enquiries/:id
   ===================================================== */
enquiriesRoutes.get("/:id", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const id = c.req.param("id");

  const { data, error } = await supabase
    .from("enquiries")
    .select("*, products(*)") // Fetch related product details safely
    .eq("id", id)
    .single();

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  return c.json({ success: true, data });
});

/* =====================================================
   🔐 ADMIN – MANUAL ENQUIRY ENTRY
   POST /enquiries
   ===================================================== */
enquiriesRoutes.post("/admin", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const { name, phone, message, source, product_id } = await c.req.json();

  if (!name || !phone || !message || !source) {
    return c.json(
      { success: false, message: "All fields are required" },
      400
    );
  }

  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      name,
      phone,
      message,
      product_id: product_id ?? null,
      source,
      status: "New",
      is_converted: false,
    })
    .select()
    .single();

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  return c.json({
    success: true,
    message: "Manual enquiry added",
    data,
  });
});

/* =====================================================
   🔐 ADMIN – UPDATE STATUS / CONVERSION
   PUT /enquiries/:id
   ===================================================== */
enquiriesRoutes.put("/:id", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const id = c.req.param("id");
  const { status, is_converted } = await c.req.json();

  const { data, error } = await supabase
    .from("enquiries")
    .update({
      status,
      is_converted,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return c.json({ success: false, message: error.message }, 500);
  }

  return c.json({ success: true, data });
});
