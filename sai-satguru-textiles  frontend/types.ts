// ================= BACKEND API TYPES =================

export interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  sub_category_id: string | null;
  brand_id: string | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  price: number;
  description: string;
  created_at: string;
  is_active: boolean;
  status?: string;
  images?: string[];
}

// ================= UI DOMAIN TYPES =================

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  subCategoryId?: string;
  brandId?: string;
  brandName?: string;
  brandSlug?: string;
  basePriceINR: number;
  priceRange?: string;
  description: string;
  images: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  label: string;
  name?: string; // Some parts use name
  slug: string;
  image?: string;
  is_active?: number | boolean;
  status?: string;
}

export interface SubCategory {
  id: string;
  categoryId: string; // mapped from category_id often? No, backend probably sends category_id.
  // Wait, if I change this I might break things if I don't check what backend sends.
  // services/categories.ts returns raw json.
  // Navbar uses `sub.category_id || sub.categoryId`.
  // I should probably add category_id to the type.
  category_id?: string;
  label: string;
  name?: string;
  slug: string;
  image?: string;
  is_active?: number | boolean;
  status?: string;
  parent_category?: { id: string };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  is_active?: boolean;
}

export interface Breadcrumb {
  label: string;
  path: string;
}

export type CurrencyCode = string;

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number;
  label: string;
}
