
import { Category, SubCategory, Product, Currency } from './types';

export const CATEGORIES: Category[] = [
  { id: 'saree', label: 'Saree', slug: 'saree' },
  { id: 'cat-brand', label: 'Catalogue Brand Collection', slug: 'catalogue-brand' },
  { id: 'kurtis', label: 'Kurtis', slug: 'kurtis' },
  { id: 'gown', label: 'Gown', slug: 'gown' },
  { id: 'lehengas', label: 'Lehengas', slug: 'lehenga' },
  { id: 'kids', label: 'Kids Wear', slug: 'kids-wear' },
  { id: 'mens', label: 'Mens Wear', slug: 'mens-wear' },
  { id: 'bedsheet', label: 'Bedsheet', slug: 'bedsheet' },
  { id: 'coord', label: 'Coord Set', slug: 'coord-set' },
  { id: 'indowestern', label: 'IndoWestern', slug: 'indowestern' },
  { id: 'blouse', label: 'ReadyMade Blouse', slug: 'readymade-blouse' },
];

export const SUB_CATEGORIES: SubCategory[] = [
  // Saree Subcategories
  { id: 's-banarasi', categoryId: 'saree', label: 'Banarasi', slug: 'banarasi' },
  { id: 's-designer', categoryId: 'saree', label: 'Designer', slug: 'designer' },
  { id: 's-party', categoryId: 'saree', label: 'Party Wear', slug: 'party-wear' },
  { id: 's-cotton', categoryId: 'saree', label: 'Cotton', slug: 'cotton' },
  { id: 's-silk', categoryId: 'saree', label: 'Silk', slug: 'silk' },
  { id: 's-wedding', categoryId: 'saree', label: 'Wedding', slug: 'wedding' },

  // Catalogue Brand Subcategories
  { id: 'cb-kimora', categoryId: 'cat-brand', label: 'Kimora', slug: 'kimora' },
  { id: 'cb-aashirwad', categoryId: 'cat-brand', label: 'Aashirwad', slug: 'aashirwad' },
  { id: 'cb-dani', categoryId: 'cat-brand', label: 'Dani Fashion', slug: 'dani-fashion' },
  { id: 'cb-vinay', categoryId: 'cat-brand', label: 'Vinay Fashion LLP', slug: 'vinay-fashion' },
  { id: 'cb-eba', categoryId: 'cat-brand', label: 'Eba Lifestyle', slug: 'eba-lifestyle' },

  // Kurtis
  { id: 'k-cotton', categoryId: 'kurtis', label: 'Daily Cotton', slug: 'cotton-kurtie' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Royal Banarasi Silk Saree',
    slug: 'royal-banarasi-silk-saree',
    categoryId: 'saree',
    subCategoryId: 's-banarasi',
    basePriceINR: 5499,
    description: 'Authentic Banarasi silk with intricate gold zari work. Perfect for weddings and grand occasions.',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop'],
    isBestSeller: true,
    isNew: true,
    createdAt: '2024-03-20T10:00:00Z'
  },
  {
    id: 'p2',
    name: 'Floral Embroidered Dress',
    slug: 'floral-embroidered-dress',
    categoryId: 'gown',
    subCategoryId: 'g-casual',
    basePriceINR: 2850,
    description: 'Elegant women fashion suit with intricate floral embroidery on premium cotton-silk fabric.',
    images: ['https://images.unsplash.com/photo-1622522264563-39327914f7be?q=80&w=1000&auto=format&fit=crop'],
    isNew: true,
    createdAt: '2024-03-19T10:00:00Z'
  },
  {
    id: 'p3',
    name: 'Bridal Velvet Lehenga',
    slug: 'bridal-velvet-lehenga',
    categoryId: 'lehengas',
    subCategoryId: 'l-bridal',
    basePriceINR: 12900,
    description: 'Heavy velvet lehenga with zardosi handwork. Comes with a matching blouse and double dupatta.',
    images: ['https://images.unsplash.com/photo-1595967783875-c371f35d8049?q=80&w=1000&auto=format&fit=crop'],
    isBestSeller: true,
    isNew: true,
    createdAt: '2024-03-18T10:00:00Z'
  },
  {
    id: 'p5',
    name: 'Designer Cotton Kurtie',
    slug: 'designer-cotton-kurtie',
    categoryId: 'kurtis',
    subCategoryId: 'k-cotton',
    basePriceINR: 1150,
    description: 'Daily wear cotton kurtie with modern block print patterns.',
    images: ['https://images.unsplash.com/photo-1609357483233-5a867fd39b7a?q=80&w=1000&auto=format&fit=crop'],
    isNew: true,
    createdAt: '2024-03-17T10:00:00Z'
  },
  // Adding more products to demonstrate pagination (12 per page)
  ...Array.from({ length: 20 }).map((_, i) => ({
    id: `p-gen-${i}`,
    name: `Premium Collection Item ${i + 1}`,
    slug: `premium-collection-item-${i + 1}`,
    categoryId: CATEGORIES[i % CATEGORIES.length].id,
    subCategoryId: '',
    basePriceINR: 2000 + (i * 100),
    description: 'High-quality textile direct from our Surat manufacturing unit.',
    images: [`https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=500&auto=format&fit=crop`],
    createdAt: new Date(Date.now() - (i + 10) * 86400000).toISOString(),
    isNew: true
  }))
];

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', rate: 1, label: 'India (INR)' },
  { code: 'USD', symbol: '$', rate: 0.012, label: 'United States (USD)' },
  { code: 'EUR', symbol: '€', rate: 0.011, label: 'European Union (EUR)' },
  { code: 'GBP', symbol: '£', rate: 0.0094, label: 'United Kingdom (GBP)' },
  { code: 'AED', symbol: 'د.إ', rate: 0.044, label: 'United Arab Emirates (AED)' },
  { code: 'CAD', symbol: '$', rate: 0.016, label: 'Canada (CAD)' },
  { code: 'AUD', symbol: '$', rate: 0.018, label: 'Australia (AUD)' },
  { code: 'SGD', symbol: '$', rate: 0.016, label: 'Singapore (SGD)' },
  { code: 'JPY', symbol: '¥', rate: 1.81, label: 'Japan (JPY)' },
  { code: 'CHF', symbol: 'CHF', rate: 0.011, label: 'Switzerland (CHF)' },
];

export const CONTACT_INFO = {
  phone: '+91 8200103821',
  phone2: '+91 9898934532',
  email: 'Saisatgurutextile@gmail.com',
  address: `Sai Satguru Textile, LOWER GROUND-504 NEW SHREE RAM MARKET, OPP MANISH MARKET, MAA ARORA KACHORI DOWN STAIRS, RING ROAD - SURAT - 395002 GUJARAT INDIA`,
  whatsapp1: '+918200103821',
  whatsapp2: '+919898934532',
  whatsappCommunity: 'https://chat.whatsapp.com/HeQicmjbgvABPvgB3hDBhW',
  instagram: 'https://www.instagram.com/sai_satguru_textile/',
  facebook: 'https://www.facebook.com/saisatgurutextile'
};
