import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import type { Env, Variables } from "../types/env";
import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "../utils/jwt";
import { getSupabaseAdmin } from "../supabase";
import { sendEmail } from "../services/email.service";

export const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/* =========================
   ADMIN LOGIN
========================= */
authRoutes.post("/login", async (c) => {
  const body = await c.req.json();
  const { password, email } = body;
  const supabase = getSupabaseAdmin(c.env);

  if (!password || !email) {
    return c.json({ success: false, message: "Email and password required" }, 400);
  }

  // Fetch admin by email
  const startDb = Date.now();
  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .single();
  const dbTime = Date.now() - startDb;

  if (error || !admin) {
    console.error("[Login Failed] DB Error:", error);
    console.warn("[Login Failed] Admin found:", !!admin);
    return c.json({ success: false, message: "Invalid credentials" }, 401);
  }

  const startBcrypt = Date.now();
  const isValid = await bcrypt.compare(password, admin.password_hash);
  const bcryptTime = Date.now() - startBcrypt;

  if (!isValid) {
    return c.json({ success: false, message: "Invalid credentials" }, 401);
  }

  // ✅ ACCESS TOKEN (15 minutes)
  // ✅ ACCESS TOKEN (1 hour)
  const accessToken = await signToken(
    { role: "admin", type: "access" },
    c.env.JWT_SECRET,
    7200
  );

  // 🍪 Secure Cookie Set
  setCookie(c, "admin_token", accessToken, {
    httpOnly: true,
    secure: c.env.ENVIRONMENT === "production", // False for dev (localhost)
    sameSite: "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return c.json({
    success: true,
    accessToken,
    user: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
  });
});

/* =========================
   FORGOT PASSWORD
========================= */
authRoutes.post("/forgot-password", async (c) => {

  const { email } = await c.req.json();
  const supabase = getSupabaseAdmin(c.env);

  if (!email) {
    return c.json({ success: false, message: "Email required" }, 400);
  }

  // Check if admin exists
  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("email", email)
    .single();

  if (!admin) {
    console.log(`❌ Admin not found for email: ${email}`);
    // Return success even if not found to prevent enumeration
    return c.json({ success: true, message: "Reset code sent if email exists" });
  }

  // Generate Reset Code (6 digits)
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

  // Verify DB update
  const { error } = await supabase
    .from("admins")
    .update({ reset_token: resetCode, reset_expires: expiresAt })
    .eq("id", admin.id);

  if (error) {
    console.error("DB Error:", error);
    return c.json({ success: false, message: "Failed to process request" }, 500);
  }

  // Send Email
  const emailResult = await sendEmail(
    c.env,
    email,
    "Password Reset Code - Sai Satguru Textiles",
    `<div style="font-family: sans-serif; padding: 20px;">
       <h2>Password Reset</h2>
       <p>You requested a password reset. Use the code below to reset your password:</p>
       <h1 style="color: #4A90E2; letter-spacing: 5px;">${resetCode}</h1>
       <p>This code expires in 15 minutes.</p>
       <p>If you didn't request this, please ignore this email.</p>
     </div>`
  );

  if (!emailResult.success) {
    return c.json({ success: false, message: `Failed to send email: ${emailResult.error}` }, 500);
  }

  return c.json({ success: true, message: "Reset code sent" });
});

/* =========================
   RESET PASSWORD
========================= */
authRoutes.post("/reset-password", async (c) => {
  const { email, code, newPassword } = await c.req.json();
  const supabase = getSupabaseAdmin(c.env);

  if (!email || !code || !newPassword) {
    return c.json({ success: false, message: "Missing required fields" }, 400);
  }

  // Verify Code
  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .single();

  if (
    !admin ||
    admin.reset_token !== code ||
    new Date(admin.reset_expires) < new Date()
  ) {
    return c.json({ success: false, message: "Invalid or expired code" }, 400);
  }

  // Hash New Password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update Password & Clear Token
  const { error } = await supabase
    .from("admins")
    .update({
      password_hash: hashedPassword,
      reset_token: null,
      reset_expires: null,
    })
    .eq("id", admin.id);

  if (error) {
    return c.json({ success: false, message: "Failed to update password" }, 500);
  }

  return c.json({ success: true, message: "Password updated successfully" });
});

/* =========================
   REFRESH TOKEN (OPTIONAL)
========================= */
authRoutes.post("/refresh", async (c) => {
  const { refreshToken } = await c.req.json();

  if (!refreshToken) {
    return c.json({ success: false, message: "Refresh token missing" }, 401);
  }

  const payload = await verifyToken(refreshToken, c.env.JWT_SECRET);

  if (!payload || payload.type !== "refresh") {
    return c.json({ success: false, message: "Invalid refresh token" }, 401);
  }

  const newAccessToken = await signToken(
    { role: "admin", type: "access" },
    c.env.JWT_SECRET,
    7200
  );

  return c.json({
    success: true,
    accessToken: newAccessToken,
  });
});



/* =========================
   LOGOUT
========================= */
authRoutes.post("/logout", (c) => {
  deleteCookie(c, "admin_token");
  return c.json({ success: true, message: "Logged out" });
});
