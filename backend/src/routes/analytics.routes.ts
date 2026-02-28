import { Hono } from "hono";
import type { Env, Variables } from "../types/env";
import { adminAuth } from "../middleware/auth";
import { getSupabaseAdmin } from "../supabase";

export const analyticsRoutes = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

analyticsRoutes.use("*", adminAuth);

analyticsRoutes.get("/", async (c) => {
  const supabase = getSupabaseAdmin(c.env);

  /* =======================
     📅 DATE FILTER (Only for trends)
  ======================= */
  const range = Number(c.req.query("range") || 7); // 7 | 30
  const from = c.req.query("from");
  const to = c.req.query("to");

  let startDate: string;
  let endDate: string = new Date().toISOString();

  if (from && to) {
    startDate = new Date(from).toISOString();
    endDate = new Date(to).toISOString();
  } else {
    startDate = new Date(
      Date.now() - range * 24 * 60 * 60 * 1000
    ).toISOString();
  }

  /* =======================
     📊 SUMMARY (LIFETIME)
  ======================= */
  const { count: totalEnquiries } = await supabase
    .from("enquiries")
    .select("*", { count: "exact", head: true });

  const { count: convertedLeads } = await supabase
    .from("enquiries")
    .select("*", { count: "exact", head: true })
    .eq("is_converted", true);

  const avgConversion =
    totalEnquiries && totalEnquiries > 0
      ? Math.round((convertedLeads! / totalEnquiries) * 100)
      : 0;

  /* =======================
     📈 ENQUIRY + CONVERSION TREND
     (DATE FILTERED)
  ======================= */
  const { data: enquiryRows } = await supabase
    .from("enquiries")
    .select("created_at, is_converted")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const enquiryMap: Record<string, number> = {};
  const conversionMap: Record<string, number> = {};

  days.forEach((d) => {
    enquiryMap[d] = 0;
    conversionMap[d] = 0;
  });

  enquiryRows?.forEach((r) => {
    const day = days[new Date(r.created_at).getDay()];
    enquiryMap[day]++;
    if (r.is_converted) conversionMap[day]++;
  });

  const enquiryTrend = days.map((d) => ({
    name: d,
    enquiries: enquiryMap[d],
  }));

  const conversionTrend = days.map((d) => ({
    name: d,
    conversionRate:
      enquiryMap[d] > 0
        ? Math.round((conversionMap[d] / enquiryMap[d]) * 100)
        : 0,
  }));

  /* =======================
     🌍 SOURCE DISTRIBUTION (LIFETIME)
     ✅ OPTION B FIX
  ======================= */
  const { data: sourceRows } = await supabase
    .from("enquiries")
    .select("source, created_at")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  const leadSources = {
    Website: 0,
    WhatsApp: 0,
    "Direct Call": 0,
  };

  sourceRows?.forEach((s) => {
    if (!s.source) return;

    const src = s.source.toLowerCase();

    if (src.includes("web")) leadSources.Website++;
    else if (src.includes("whatsapp")) leadSources.WhatsApp++;
    else if (src.includes("direct")) leadSources["Direct Call"]++;
  });


  /* =======================
     🏆 TOP PRODUCTS (LIFETIME)
  ======================= */
  const { data: topProducts } = await supabase.rpc(
    "top_products_by_enquiry"
  );

  /* =======================
     🧵 CATEGORY INTEREST (LIFETIME)
  ======================= */
  const { data: categoryInterest } = await supabase.rpc(
    "category_interest"
  );

  /* =======================
     🤖 AI INSIGHT (Stable)
  ======================= */
  const aiInsight =
    totalEnquiries && totalEnquiries > 0
      ? "Customer interest is rising in top-performing categories. Focus on fast-moving products and WhatsApp conversions."
      : "AI insights will appear once enquiry data increases.";

  /* =======================
     ✅ RESPONSE
  ======================= */
  return c.json({
    success: true,
    data: {
      summary: {
        totalEnquiries: totalEnquiries ?? 0,
        avgConversion,
        visitors: 0,
        revenue: 0,
      },
      enquiryTrend,
      conversionTrend,
      leadSources,
      topProducts: topProducts ?? [],
      categoryInterest: categoryInterest ?? [],
      aiInsight,
    },
  });
});
