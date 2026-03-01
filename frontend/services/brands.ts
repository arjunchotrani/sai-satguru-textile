
import { Brand } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetch all active brands
 */
export async function fetchBrands(): Promise<Brand[]> {
    try {
        const res = await fetch(`${API_BASE}/brands`);
        if (!res.ok) throw new Error("Failed to fetch brands");
        const json = await res.json();
        const rawBrands = json.data || [];

        // Ensure every brand has a slug (fallback to name-based generation)
        return rawBrands.map((b: any) => ({
            ...b,
            slug: b.slug || b.name.toLowerCase().replace(/\s+/g, '-')
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
        // We might need a specific endpoint for this, or filter from all brands
        // Assuming backend has /brands/:slug or we filter client side if list is small.
        // Ideally backend should support /brands?slug=... or /brands/:slug

        // For now, let's try fetching all and filtering if no direct endpoint exists, 
        // OR try the direct endpoint. Let's assume standard REST pattern.
        const res = await fetch(`${API_BASE}/brands/${slug}`);

        if (res.ok) {
            const json = await res.json();
            return json.data || json;
        }

        // Fallback: fetch all and find
        const allBrands = await fetchBrands();
        return allBrands.find(b => b.slug === slug) || null;

    } catch (error) {
        console.error(`Error fetching brand ${slug}:`, error);
        return null;
    }
}
