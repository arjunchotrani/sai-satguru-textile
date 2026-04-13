/**
 * Normalizes a brand/category name into a URL-safe slug.
 *
 * Rules:
 * - Lowercase
 * - Trim leading/trailing whitespace
 * - Replace any sequence of non-alphanumeric characters with a single hyphen
 * - Remove leading/trailing hyphens
 *
 * Examples:
 *   "Alizeh – Official"  → "alizeh-official"
 *   "Kimora  Fashion"    → "kimora-fashion"
 *   "  Sayuri Designer " → "sayuri-designer"
 */
export function normalizeSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
