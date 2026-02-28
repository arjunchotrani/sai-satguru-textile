import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import type { Env, Variables } from "../types/env";
import { verifyToken } from "../utils/jwt";

export const adminAuth: MiddlewareHandler<{
  Bindings: Env;
  Variables: Variables;
}> = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const cookieToken = getCookie(c, "admin_token");

  const token = cookieToken || (authHeader ? authHeader.replace("Bearer ", "") : null);

  if (!token) {
    // Silent fail on missing token to avoid log noise, unless strictly debugging
    return c.json({ success: false, message: "Unauthorized - Missing Token" }, 401);
  }

  try {
    const payload: any = await verifyToken(token, c.env.JWT_SECRET);

    if (!payload) {
      return c.json({ success: false, message: "Unauthorized - Invalid or Expired Token" }, 401);
    }

    // 🔒 Admin-only access
    if (payload.role !== "admin") {
      console.warn(`[Auth Warning] Access denied for role: ${payload.role}`);
      return c.json({ success: false, message: "Admin access required" }, 403);
    }

    // attach payload to context (NOW TYPE-SAFE)
    c.set("admin", payload);

    await next();
  } catch (error) {
    console.error("[Auth Error] Token verification failed:", error);
    return c.json(
      { success: false, message: "Unauthorized - Invalid or Expired Token" },
      401
    );
  }
};
