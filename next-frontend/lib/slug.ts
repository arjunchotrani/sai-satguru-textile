/**
 * Standardizes a string into a URL-friendly slug.
 * Synchronized with backend logic to ensure consistency.
 */
export function createSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
