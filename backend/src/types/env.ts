import type { SupabaseClient } from "@supabase/supabase-js";

export interface Env {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;

  // Admin auth
  ADMIN_PASSWORD_HASH: string;
  JWT_SECRET: string;

  // Cloudflare R2
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_URL: string;
  R2_BUCKET: R2Bucket; // Added R2Bucket binding

  // Email
  MAIL_USER: string;
  MAIL_PASS: string;
  GEMINI_API_KEY: string;
  ENVIRONMENT?: string;

  // KV Namespaces
  CACHE_KV: KVNamespace;

  ALLOWED_ORIGINS?: string;
}

/**
 * 🔑 Hono context variables
 * This fixes: c.get("supabase") type errors
 */
export interface Variables {
  supabase: SupabaseClient;
  admin?: {
    role: string;
  };
}
