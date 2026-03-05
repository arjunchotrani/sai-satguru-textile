import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "@supabase/supabase-js";
import { trackVisitor } from "./middleware/trackVisitor";

import type { Env, Variables } from "./types/env";

import { authRoutes } from "./routes/auth.routes";
import { categoriesRoutes } from "./routes/categories.routes";
import { subcategoriesRoutes } from "./routes/subcategories.routes";
import { productsRoutes } from "./routes/products.routes";
import { productImagesRoutes } from "./routes/product-images.routes";
import { enquiriesRoutes } from "./routes/enquiries.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import { analyticsRoutes } from "./routes/analytics.routes";
import { brandsRoutes } from "./routes/brands.routes";
import { sitemapRoutes } from "./routes/sitemap.routes";

const app = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

app.use("*", async (c, next) => {
  // ⚡ Non-blocking analytics
  if (c.executionCtx && typeof c.executionCtx.waitUntil === "function") {
    c.executionCtx.waitUntil(trackVisitor(c.req.raw, c.env));
  } else {
    // Fallback/Dev Mode: Run without await to optimize speed
    trackVisitor(c.req.raw, c.env).catch(console.error);
  }
  await next();
});

/* =====================================================
   🌍 GLOBAL CORS (PUBLIC WEBSITE + ADMIN PANEL)
===================================================== */
app.use(
  "*",
  (c, next) => {
    const allowed = (c.env.ALLOWED_ORIGINS || "")
      .split(",")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((x: string) => x.trim())
      .filter((x: string) => x.length > 0);

    // Default local dev
    if (allowed.length === 0) {
      allowed.push("http://localhost:3000", "http://localhost:3001");
    }

    return cors({
      origin: allowed,
      allowHeaders: ["Content-Type", "Authorization", "Upgrade-Insecure-Requests"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true, // Required for cookies
    })(c, next);
  }
);

/* =====================================================
   🔑 SUPABASE CLIENT INJECTION (CRITICAL)
===================================================== */
app.use("*", async (c, next) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  );

  c.set("supabase", supabase);
  await next();
});

/* =====================================================
   ❤️ HEALTH CHECK
===================================================== */
app.get("/", (c) =>
  c.json({
    success: true,
    service: "Sai Satguru Textile Backend",
    status: "running",
  })
);



/* =====================================================
   🗺️ SITEMAP ROUTES (PUBLIC, NO AUTH)
===================================================== */
app.route("/", sitemapRoutes);

/* =====================================================
   🌐 PUBLIC READ-ONLY ROUTES (WEBSITE)
   ✔ No auth
   ✔ Safe to expose
===================================================== */
app.route("/products", productsRoutes);
app.route("/product-images", productImagesRoutes);
app.route("/enquiries", enquiriesRoutes);


app.route("/categories", categoriesRoutes);
app.route("/subcategories", subcategoriesRoutes);
app.route("/brands", brandsRoutes);

/* =====================================================
   🔐 ADMIN ROUTES (JWT PROTECTED)
===================================================== */
app.route("/admin", authRoutes);
app.route("/admin/dashboard", dashboardRoutes);
app.route("/admin/analytics", analyticsRoutes);

app.route("/admin/categories", categoriesRoutes);
app.route("/admin/subcategories", subcategoriesRoutes);
app.route("/admin/products", productsRoutes);
app.route("/admin/product-images", productImagesRoutes);
app.route("/admin/enquiries", enquiriesRoutes);
app.route("/admin/brands", brandsRoutes);

export default app;
