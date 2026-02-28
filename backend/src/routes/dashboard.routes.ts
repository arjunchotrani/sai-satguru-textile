import { Hono } from "hono";
import type { Env, Variables } from "../types/env";
import { getSupabaseAdmin } from "../supabase";
import { adminAuth } from "../middleware/auth";

export const dashboardRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

dashboardRoutes.get("/", adminAuth, async (c) => {
  const supabase = getSupabaseAdmin(c.env);

  /* Total real visitors (from KV – matches trackVisitor middleware) */
  const totalVisitorsRaw = await c.env.CACHE_KV.get("visitors:total");
  const totalVisitors = totalVisitorsRaw ? parseInt(totalVisitorsRaw) : 0;

  /* Today's visitors (from KV) */
  const today = new Date().toISOString().split("T")[0];
  const todayVisitorsRaw = await c.env.CACHE_KV.get(`visitors:daily:${today}`);
  const todayVisitors = todayVisitorsRaw ? parseInt(todayVisitorsRaw) : 0;

  /* Total enquiries */
  const { count: totalEnquiries } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true });

  /* Converted leads */
  const { count: convertedLeads } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("is_converted", true);

  /* Enquiries trend (last 7 days ONLY) */
  const { data: rows } = await supabase
    .from("enquiries")
    .select("created_at")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const trend: Record<string, number> = {};
  days.forEach(d => (trend[d] = 0));

  rows?.forEach(r => {
    const day = days[new Date(r.created_at).getDay()];
    trend[day]++;
  });

  const enquiryTrend = days.map(d => ({
    name: d,
    enquiries: trend[d],
  }));

  /* Lead sources (Optimized: Get grouped count via RPC if possible, else simplified) */
  // Note: Grouping without RPC in Supabase JS client is hard. 
  // We will assume the RPC is the way to go for the future, but for now keep the JS loop
  // BUT only select the 'source' field, not *
  const { data: sources } = await supabase
    .from("enquiries")
    .select("source");

  const leadSources = {
    Website: 0,
    WhatsApp: 0,
    "Direct Call": 0,
  };

  sources?.forEach(s => {
    const source = s.source?.trim().toLowerCase();
    if (source === "website") leadSources.Website++;
    else if (source === "whatsapp") leadSources.WhatsApp++;
    else if (source === "direct call") leadSources["Direct Call"]++;
  });

  return c.json({
    success: true,
    totalVisitors: totalVisitors ?? 0,
    todayVisitors: todayVisitors ?? 0,
    totalEnquiries: totalEnquiries ?? 0,
    convertedLeads: convertedLeads ?? 0,
    enquiryTrend,
    leadSources,
  });
});
