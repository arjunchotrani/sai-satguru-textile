import { fetchCategories, fetchSubCategories } from './api';
import { Category, SubCategory } from './types';

let categoryCache: Category[] | null = null;
let subCategoryCache: SubCategory[] | null = null;
let lastFetch: number = 0;
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

/**
 * Returns the full catalog of categories and subcategories.
 * Uses a singleton cache to avoid redundant network requests across page transitions.
 */
export async function getCatalog() {
    const now = Date.now();
    
    if (categoryCache && subCategoryCache && (now - lastFetch < CACHE_TTL)) {
        return { categories: categoryCache, subCategories: subCategoryCache };
    }

    try {
        const [categories, subCategories] = await Promise.all([
            fetchCategories(),
            fetchSubCategories()
        ]);
        
        categoryCache = categories;
        subCategoryCache = subCategories;
        lastFetch = now;
        
        return { categories, subCategories };
    } catch (e) {
        console.error('[Catalog] Failed to hydrate catalog cache:', e);
        return { 
            categories: categoryCache || [], 
            subCategories: subCategoryCache || [] 
        };
    }
}

/**
 * Force a refresh of the catalog cache.
 */
export async function refreshCatalog() {
    categoryCache = null;
    return getCatalog();
}
