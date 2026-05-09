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
  slug: string;
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
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  whatsappInquiryStatus?: string;
  displayOrder?: number;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  // Relations
  // Relations
  category?: { id: string; name: string; slug: string; label: string };
  subCategory?: { id: string; name: string; slug: string; label: string };


  brand?: { id: string; name: string; slug: string; logo_url?: string };
}

export interface Category {
  id: string;
  label: string;
  name?: string; // Some parts use name
  slug: string;
  image?: string;
  is_active?: number | boolean;
  display_order?: number;
  status?: string;
}

export interface SubCategory {
  id: string;
  categoryId: string; 
  category_id?: string;
  label: string;
  name?: string;
  slug: string;
  image?: string;
  is_active?: number | boolean;
  display_order?: number;
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
