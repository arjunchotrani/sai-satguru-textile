import { Product } from './types';
import { CONTACT_INFO } from './constants';

const SITE_URL = 'https://saisatgurutextile.com'; // Adjust to production URL

/**
 * Generates the Organization Schema for the entire site
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sai Satguru Textile",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": CONTACT_INFO.phone,
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    },
    "sameAs": [
      CONTACT_INFO.instagram,
      CONTACT_INFO.facebook
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "LOWER GROUND-504 NEW SHREE RAM MARKET, OPP MANISH MARKET, MAA ARORA KACHORI DOWN STAIRS, RING ROAD",
      "addressLocality": "Surat",
      "addressRegion": "Gujarat",
      "postalCode": "395002",
      "addressCountry": "IN"
    }
  };
}

/**
 * Generates Breadcrumb Schema for reliable SEO hierarchy navigation
 */
export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SITE_URL}${item.item}`
    }))
  };
}

/**
 * Generates LocalBusiness (ClothingStore) Schema for local SEO / Google Maps
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "name": "Sai Satguru Textile",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "image": `${SITE_URL}/logo-512.png`,
    "telephone": CONTACT_INFO.phone,
    "email": CONTACT_INFO.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "LOWER GROUND-504 NEW SHREE RAM MARKET, OPP MANISH MARKET, MAA ARORA KACHORI DOWN STAIRS, RING ROAD",
      "addressLocality": "Surat",
      "addressRegion": "Gujarat",
      "postalCode": "395002",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "21.1702",
      "longitude": "72.8311"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "10:00",
        "closes": "20:00"
      }
    ],
    "priceRange": "₹₹",
    "description": "Premium wholesale textile manufacturer in Surat specializing in sarees, kurtis, lehengas and catalog brands.",
    "sameAs": [
      CONTACT_INFO.instagram,
      CONTACT_INFO.facebook
    ]
  };
}

/**
 * Generates FAQ Schema for rich results
 */
export function generateFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generates the core Product Schema
 */
export function generateProductSchema(product: Product, categoryName: string = 'Products', brandName: string = 'Sai Satguru Textile') {
  const primaryImage = product.images?.[0] || `${SITE_URL}/logo.png`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.map(img => img.startsWith('http') ? img : `${SITE_URL}${img}`) || [primaryImage],
    "description": product.description || `Buy ${product.name} at wholesale prices. Premium quality from Sai Satguru Textile.`,
    "sku": product.id,
    "mpn": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand?.name || product.brandName || brandName
    },
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/product/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.basePriceINR,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Sai Satguru Textile"
      }
    },
    "category": categoryName
  };
}
