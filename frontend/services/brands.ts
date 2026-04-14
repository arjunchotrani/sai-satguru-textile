
import { Brand } from "../types";
import { normalizeSlug } from "../utils/slug";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetch all active brands
 */
export async function fetchBrands(): Promise<Brand[]> {
    try {
        const res = await fetch(`${API_BASE}/brands`);
        if (!res.ok) throw new Error("Failed to fetch brands");
        const json: any = await res.json();
        const rawBrands = json.data || [];

        // Ensure every brand has a normalized slug (fallback to name-based generation)
        return rawBrands.map((b: any) => ({
            ...b,
            slug: b.slug ? normalizeSlug(b.slug) : normalizeSlug(b.name)
        }));
    } catch (error) {
        console.error("Error fetching brands:", error);
        return [];
    }
}

/**
 * Fetch a single brand by slug
 */
export async function fetchBrandBySlug(slug: string): Promise<Brand | null> {
    try {
        // Always normalize the slug before fetching — guards against DB slugs with spaces
        const cleanSlug = normalizeSlug(slug);

        const res = await fetch(`${API_BASE}/brands/${cleanSlug}`);

        if (res.ok) {
            const json: any = await res.json();
            return json.data || json;
        }

        // Fallback: fetch all and find by normalized slug
        const allBrands = await fetchBrands();
        return allBrands.find(b => normalizeSlug(b.slug || b.name) === cleanSlug) || null;

    } catch (error) {
        console.error(`Error fetching brand ${slug}:`, error);
        return null;
    }
}
