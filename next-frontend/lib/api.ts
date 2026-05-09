import { cache } from 'react';
import { Category, SubCategory, BackendProduct, Product, Brand } from './types';

// Utility for slugs
export function normalizeSlug(slug?: string): string {
    if (!slug) return '';
    try {
        // Fix: decode correctly and apply backend-sync regex
        const decoded = decodeURIComponent(slug.replace(/\+/g, ' '));
        return decoded
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Synchronized with backend routes
            .replace(/^-+|-+$/g, '');
    } catch (e) {
        return slug
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') 
            .replace(/^-+|-+$/g, '');
    }
}


// Map raw backend API to frontend types to ensure components receive valid types
export function mapBackendProduct(backendProduct: BackendProduct | any): Product {
    if (!backendProduct) {
        throw new Error("Cannot map undefined product");
    }

    // brandName: /by-slug/ returns it directly; list endpoints return via brands relation
    const brandName = backendProduct.brandName
        || backendProduct.brand
        || backendProduct.brands?.name
        || null;

    const brandSlug = backendProduct.brandSlug
        || backendProduct.brands?.slug
        || null;
    
    return {
        id: backendProduct.id,
        name: backendProduct.name,
        slug: backendProduct.slug,
        description: backendProduct.description,
        categoryId: backendProduct.category_id ?? backendProduct.categoryId,
        subCategoryId: backendProduct.sub_category_id ?? backendProduct.subCategoryId,
        brandId: backendProduct.brand_id ?? backendProduct.brandId,
        brandName,
        brandSlug,
        basePriceINR: Number(backendProduct.price ?? backendProduct.base_price_inr ?? backendProduct.basePriceINR ?? 0),
        images: Array.isArray(backendProduct.images) ? backendProduct.images.map((img: string) => img.replace(/^"|"$/g, '')) : [],
        isActive: backendProduct.is_active === 1 || backendProduct.is_active === true,
        createdAt: backendProduct.created_at,
        updatedAt: backendProduct.updated_at,
        whatsappInquiryStatus: backendProduct.whatsapp_inquiry_status,
        displayOrder: backendProduct.display_order ?? 0,
        tags: Array.isArray(backendProduct.tags) ? backendProduct.tags : [],
        metaTitle: backendProduct.meta_title,
        metaDescription: backendProduct.meta_description,
        // Relations
        category: backendProduct.categories ? { id: backendProduct.categories?.id, name: backendProduct.categories?.name, slug: backendProduct.categories?.slug, label: backendProduct.categories?.label || backendProduct.categories?.name || 'Category' } : undefined,
        subCategory: (backendProduct.sub_categories || backendProduct.subcategories) ? { 
            id: (backendProduct.sub_categories || backendProduct.subcategories)?.id, 
            name: (backendProduct.sub_categories || backendProduct.subcategories)?.name, 
            slug: (backendProduct.sub_categories || backendProduct.subcategories)?.slug, 
            label: (backendProduct.sub_categories || backendProduct.subcategories)?.label || (backendProduct.sub_categories || backendProduct.subcategories)?.name || 'Sub-Category' 
        } : undefined,
        brand: backendProduct.brands ? { id: backendProduct.brands?.id, name: backendProduct.brands?.name, slug: backendProduct.brands?.slug, logo_url: backendProduct.brands?.logo_url } : undefined,
    };


}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class ApiException extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
  }
}

/**
 * Standard fetch wrapper for Server Components.
 * Allows using Next.js specific fetch options (like revalidate).
 */
export async function serverFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const start = Date.now();
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Default revalidation of 60 seconds for catalog data
      next: { revalidate: 60 },
      ...options,
    });

    const duration = Date.now() - start;
    if (duration > 50) {
    }

    if (!response.ok) {

        let errorMsg = response.statusText;
        try {
           const body = await response.json();
           if(body.error) errorMsg = body.error;
        } catch(e) {}
        throw new ApiException(errorMsg, response.status);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    // Let the calling function handle the error or logging.
    // Next.js 14+ Dev Mode intercepts console.error and shows a red overlay wrapper,
    // which is annoying for expected fallback 404s.
    throw error;
  }
}

// ==== Endpoint Wrappers (Reusable Server Data Fetchers) ====

/**
 * fetchCategories - Memoized at request level
 */
export const fetchCategories = cache(async function(): Promise<Category[]> {
  try {
    const res = await serverFetch<Category[] | { data?: Category[], categories?: Category[] }>('/categories');
    return Array.isArray(res) ? res : (res.data || res.categories || []);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
});

/**
 * fetchSubCategories - Memoized at request level
 */
export const fetchSubCategories = cache(async function(): Promise<SubCategory[]> {
  try {
    const res = await serverFetch<SubCategory[] | { data?: SubCategory[], subcategories?: SubCategory[] }>('/subcategories');
    return Array.isArray(res) ? res : (res.data || res.subcategories || []);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
});

export const fetchCategoryBySlug = cache(async function(slug: string): Promise<Category | null> {
    try {
        // Uses the already memoized fetchCategories()
        const cats = await fetchCategories();
        return cats.find(c => c.slug === slug) || null;
    } catch(e) { return null; }
});

export const fetchSubCategoryBySlug = cache(async function(slug: string): Promise<SubCategory | null> {
    try {
        // Uses the already memoized fetchSubCategories()
        const subs = await fetchSubCategories();
        return subs.find(s => s.slug === slug) || null;
    } catch(e) { return null; }
});

export async function fetchProducts(queryParams: URLSearchParams = new URLSearchParams()): Promise<{products: Product[], total: number, page: number, limit: number}> {
  try {
      const q = queryParams.toString();
      const endpoint = q ? `/products?${q}` : `/products`;
      const res = await serverFetch<{data?: any[], products?: any[], total?: number, page?: number, limit?: number}>(endpoint);
      return {
          products: (res.data || res.products || []).map(mapBackendProduct),
          total: res.total || 0,
          page: res.page || 1,
          limit: res.limit || 12
      };
  } catch (error) {
      console.error("Error fetching products:", error);
      return { products: [], total: 0, page: 1, limit: 12 };
  }
}

export async function fetchNewArrivals(page: number = 1, limit: number = 12): Promise<{products: Product[], total: number}> {
  try {
      const res = await serverFetch<{data?: any[], products?: any[], total?: number}>(`/products?sort=latest&page=${page}&limit=${limit}`);
      return {
          products: (res.data || res.products || []).map(mapBackendProduct),
          total: res.total || 0
      };
  } catch (error) {
      console.error("Error fetching new arrivals:", error);
      return { products: [], total: 0 };
  }
}

// Shared memory cache for products (Persistent across client navigation)
const productMemoryCache = new Map<string, { data: Product; timestamp: number }>();
const CLIENT_SWR_TTL = 1000 * 60 * 5; // 5 minutes

export const fetchProductBySlug = cache(async function(slug: string, lean: boolean = false): Promise<Product | null> {
    const cleanSlug = normalizeSlug(slug);
    const cacheKey = `${cleanSlug}:${lean ? 'lean' : 'full'}`;

    // 1. Instant Cache Hit (SWR)
    if (typeof window !== 'undefined') {
        const cached = productMemoryCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CLIENT_SWR_TTL)) {
            // Background refresh logic could be added here
            return cached.data;
        }
    }

    try {
        const endpoint = `/products/by-slug/${cleanSlug}${lean ? '?lean=true' : ''}`;
        const res = await serverFetch<{ success?: boolean; data?: any } | any>(endpoint);
        const raw = res?.data || res;
        
        if (raw && raw.id) {
            const mapped = mapBackendProduct(raw);
            // Update memory cache
            if (typeof window !== 'undefined') {
                productMemoryCache.set(cacheKey, { data: mapped, timestamp: Date.now() });
            }
            return mapped;
        }
    } catch (e) {
        console.warn(`[fetchProductBySlug] Primary lookup failed for ${cleanSlug}. Attempting fallback search...`);
    }

    // FINAL RESILIENCE FALLBACK: Search by name if slug fails
    try {
        const fuzzyName = cleanSlug.replace(/-/g, ' ');
        const { products } = await fetchProducts(new URLSearchParams({ 
            search: fuzzyName,
            limit: '1' 
        }));
        
        if (products.length > 0) {
            return products[0];
        }
    } catch (e) {
        console.error(`[fetchProductBySlug] Total failure for ${cleanSlug}:`, e);
    }
    
    return null;
});


/**
 * fetchBrands - Memoized at request level
 */
export const fetchBrands = cache(async function(): Promise<Brand[]> {
    try {
        const res = await serverFetch<{data?: Brand[]} | Brand[]>('/brands');
        const rawBrands = Array.isArray(res) ? res : (res.data || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rawBrands.map((b: any) => ({
            ...b,
            slug: b.slug ? normalizeSlug(b.slug as string) : normalizeSlug(b.name as string)
        }) as Brand);
    } catch (error) {
        console.error("Error fetching brands:", error);
        return [];
    }
});

export const fetchBrandBySlug = cache(async function(slug: string): Promise<Brand | null> {
    const cleanSlug = normalizeSlug(slug);
    
    // Attempt 1: Direct fetch from backend (Legacy support for ID or exact Slug)
    try {
        const res = await serverFetch<{data?: Brand} | Brand>(`/brands/${cleanSlug}`);
        const brandData = ('data' in res ? res.data : res) as Record<string, unknown>;
        if (brandData && brandData.id) return brandData as unknown as Brand;
    } catch (e) {
        console.warn(`[fetchBrandBySlug] Direct lookup failed for ${cleanSlug}. Attempting fuzzy list match.`);
    }

    // Attempt 2: Resilient List Lookup (Matches normalized Name to Slug)
    try {
        const allBrands = await fetchBrands();
        const found = allBrands.find(b => {
           const normalizedName = normalizeSlug(b.name);
           const normalizedBrandSlug = b.slug ? normalizeSlug(b.slug) : '';
           return normalizedName === cleanSlug || normalizedBrandSlug === cleanSlug;
        });
        
        if (found) {
            return found;
        }
    } catch (e) {
        console.error(`[fetchBrandBySlug] Critical failure:`, e);
    }
    
    return null;
});


