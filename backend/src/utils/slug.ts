import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Standardizes a string into a URL-friendly slug.
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generates a unique slug for a given table by appending numeric suffixes if collisions occur.
 * Ensures SEO-friendly, clean URLs without random strings.
 */
export async function generateUniqueSlug(
  supabase: SupabaseClient,
  name: string,
  table: "products" | "categories" | "sub_categories" | "brands" = "products"
): Promise<string> {
  const baseSlug = createSlug(name);
  let finalSlug = baseSlug;
  let counter = 1;

  while (true) {
    const { data: existing } = await supabase
      .from(table)
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    if (!existing) {
      break; // Found a unique slug
    }

    // Collision detected: Append an incrementing suffix
    counter++;
    finalSlug = `${baseSlug}-${counter}`;
  }

  return finalSlug;
}
