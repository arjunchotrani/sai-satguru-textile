export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;

  // backend fields
  is_active: boolean;
  created_at: string;

  // derived counts (from backend query)
  subcategory_count: number;
  product_count: number;
}


export interface SubCategory {
  id: string;
  name: string;
  category_id: string;

  /* 🔥 REQUIRED */
  is_active: boolean;

  /* 🔢 COUNTS */
  product_count?: number;

  /* OPTIONAL (safe for future) */
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;

  category_id: string;
  subcategory_id?: string;

  is_active: boolean;   // 🔥 REQUIRED

  description?: string;
  primary_image?: string;

  // Brand Fields
  brand?: string;
  brand_type?: 'Branded' | 'Non-Branded';
}


export type EnquiryStatus = 'New' | 'Contacted' | 'Converted' | 'Dropped';
export type EnquirySource = 'Website' | 'WhatsApp' | 'Call';

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  productId?: string;
  productName?: string;
  source: EnquirySource;
  status: EnquiryStatus;
  notes: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin';
  name: string;
}

export interface BusinessConfig {
  businessName: string;
  whatsappNumber: string;
  captionTemplate: string;
  demoMode: boolean;
}
