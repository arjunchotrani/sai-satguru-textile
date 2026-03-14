import type { BackendProduct, Product } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL;


/* ================= MAP BACKEND → FRONTEND ================= */
function mapBackendProduct(
  p: BackendProduct,
  overrideImages?: string[]
): Product {
  // Use override if provided, else use images from backend product, else empty array
  const finalImages = overrideImages && overrideImages.length > 0
    ? overrideImages
    : (p.images || []);

  // Handle case where brand might be a string from backend
  const brandObj = typeof p.brand === 'object' ? p.brand : null;
  const brandName = brandObj ? brandObj.name : (typeof p.brand === 'string' ? p.brand : undefined);

  return {
    id: String(p.id).replace(/\s+/g, '-'),
    name: p.name || 'Untitled Product',
    categoryId: p.category_id,
    subCategoryId: p.sub_category_id ?? undefined,
    brandId: p.brand_id ?? undefined,
    brandName: brandName,
    brandSlug: brandObj?.slug,
    basePriceINR: p.price || 0,
    description: p.description || '',
    images: finalImages,
    createdAt: p.created_at,
    isNew: true,
  };
}

/* ==========================================================
   🆕 NEW ARRIVALS (Homepage only – image rich, paginated)
========================================================== */
export async function fetchNewArrivals(page = 1, limit = 12, skipImages = false) {
  const res = await fetch(`${API_BASE}/products?page=${page}&limit=${limit}`);

  if (!res.ok) throw new Error("Failed to fetch new arrivals");
  const json = await res.json();
  const data = Array.isArray(json) ? json : json.data || [];

  const validProducts = data.filter((p: BackendProduct) => {
    // Check for boolean false or numeric 0 (runtime safety)
    if (p.is_active === false || (p.is_active as any) === 0) return false;
    // Check status if available
    if (p.status && String(p.status).toLowerCase() === 'inactive') return false;
    return true;
  });

  const products: Product[] = validProducts.map((p: BackendProduct) => {
    return mapBackendProduct(p);
  });

  return {
    products,
    total: json.total || products.length,
    page: json.page || 1,
    limit: json.limit || limit,
  };
}

export async function fetchProductImages(productId: string): Promise<string[]> {
  const imgRes = await fetch(
    `${API_BASE}/product-images?product_id=${productId}`
  );

  if (imgRes.ok) {
    const imgJson = await imgRes.json();
    if (imgJson.success && Array.isArray(imgJson.data)) {
      return imgJson.data.map((img: any) => img.image_url);
    }
  }
  return [];
}

/* ==========================================================
   📦 GENERIC PRODUCT FETCH (Category / SubCategory pages)
   ⚡ Fast – NO image fetching here
========================================================== */
export async function fetchProducts(filters: {
  category_id?: string;
  sub_category_id?: string;
  brand_id?: string;
  search?: string;
  limit?: number;
  includeImages?: boolean;
  sort?: string;
} = {}) {
  const params = new URLSearchParams();

  if (filters.category_id) {
    params.append("category_id", filters.category_id);
  }

  if (filters.sub_category_id) {
    params.append("sub_category_id", filters.sub_category_id);
  }

  if (filters.brand_id) {
    params.append("brand", filters.brand_id);
  }

  if (filters.search) {
    params.append("search", filters.search);
  }

  if (filters.limit) {
    params.append("limit", String(filters.limit));
  }

  if (filters.sort) {
    params.append("sort", filters.sort);
  }

  const res = await fetch(
    `${API_BASE}/products?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const json = await res.json();
  const rawData = json.data as BackendProduct[];

  // Filter inactive products
  const activeProducts = rawData.filter(p => {
    if (p.is_active === false || (p.is_active as any) === 0) return false;
    // @ts-ignore
    if (p.status && String(p.status).toLowerCase() === 'inactive') return false;
    return true;
  });

  // Map products. Each product might already have images embedded from the backend.
  return activeProducts.map(p => mapBackendProduct(p));
}

/* ==========================================================
   📦 PAGINATED PRODUCT FETCH (Category / SubCategory pages)
   ⚡ Supports Infinite Scroll
   ========================================================== */
export async function fetchProductsPaginated(filters: {
  category_id?: string;
  sub_category_id?: string;
  brand_id?: string;
  search?: string;
  limit?: number;
  page?: number;
  sort?: string;
} = {}) {
  const params = new URLSearchParams();

  if (filters.category_id) params.append("category_id", filters.category_id);
  if (filters.sub_category_id) params.append("sub_category_id", filters.sub_category_id);
  if (filters.brand_id) params.append("brand", filters.brand_id);
  if (filters.search) params.append("search", filters.search);

  params.append("limit", String(filters.limit || 50));
  params.append("page", String(filters.page || 1));
  if (filters.sort) params.append("sort", filters.sort);

  const res = await fetch(`${API_BASE}/products?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const json = await res.json();
  const rawData = json.data as BackendProduct[];

  // Filter inactive products
  const activeProducts = rawData.filter(p => {
    if (p.is_active === false || (p.is_active as any) === 0) return false;
    // @ts-ignore
    if (p.status && String(p.status).toLowerCase() === 'inactive') return false;
    return true;
  });

  return {
    products: activeProducts.map(p => mapBackendProduct(p)),
    total: json.total || activeProducts.length,
    page: json.page || 1,
    limit: json.limit || 50,
  };
}

/* ==========================================================
   🆔 FETCH SINGLE PRODUCT (Product Detail Page)
   ✨ Helper to get full details + images
========================================================== */
import { withCache } from './cache';

// ... (other imports)

/* ==========================================================
   🆔 FETCH SINGLE PRODUCT (Product Detail Page)
   ✨ Helper to get full details + images
========================================================== */
export async function fetchProductById(id: string): Promise<Product | null> {
  const cacheKey = `product-detail-${id}`;

  return withCache(cacheKey, async () => {
    try {
      const url = `${API_BASE}/products/${id}`;
      const res = await fetch(url);

      if (!res.ok) {
        const msg = `Failed to fetch product: ${res.status} ${res.statusText} (URL: ${url})`;
        console.error(`❌ [fetchProductById] ${msg}`);
        throw new Error(msg);
      }

      const json = await res.json();
      const productData = json.data || json;

      if (!productData || !productData.id) {
        console.error("❌ [fetchProductById] Invalid data received:", json);
        throw new Error("Invalid product data structure received");
      }

      // Backend now returns images embedded in the product object as a flat string array
      return mapBackendProduct(productData);

    } catch (error) {
      console.error("Error fetching product by ID:", error);
      return null;
    }
  }, 2 * 60 * 1000); // 2 minute cache
}
