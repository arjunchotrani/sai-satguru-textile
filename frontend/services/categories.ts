import { withCache } from './cache';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/* =======================
   Fetch ALL Categories
   ======================= */
export async function fetchCategories() {
  return withCache('categories-all', async () => {
    const res = await fetch(`${API_BASE}/categories`);

    if (!res.ok) {
      throw new Error("Failed to fetch categories");
    }

    const json = await res.json();
    return json.data;
  });
}

/* =======================
   Fetch Sub-Categories
   ======================= */
export async function fetchSubCategories(categoryId?: string) {
  const cacheKey = categoryId ? `subcategories-${categoryId}` : 'subcategories-all';

  return withCache(cacheKey, async () => {
    const url = categoryId
      ? `${API_BASE}/subcategories?category_id=${categoryId}`
      : `${API_BASE}/subcategories`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Failed to fetch subcategories");
    }

    const json = await res.json();
    return json.data;
  });
}
