import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  fetchBrandBySlug, 
  fetchProducts, 
  fetchCategories,
  normalizeSlug 
} from '../../../lib/api';
import { BrandLandingUI } from '../../../components/BrandLandingUI';
import { BrandSeoSection, buildFaqs } from '../../../components/BrandSeoSection';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await fetchBrandBySlug(slug);
  if (!brand) return {};

  const title = `${brand.name} Collection`;
  const description = `Explore the latest ${brand.name} collection at Sai Satguru Textile. Discover curated wholesale textile products, catalogue styles, and enquiry-based sourcing support from Surat.`;

  return {
    title, // Layout template will append " | Sai Satguru Textile"
    description,
    alternates: {
      canonical: `/brand/${normalizeSlug(brand.slug || brand.name)}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function BrandLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Parallel fetch initial brand data
  const brand = await fetchBrandBySlug(slug);
  if (!brand) {
    notFound();
  }

  // Fetch all products for this brand and full category list in parallel
  const [{ products: allBrandProductsRaw }, allCats] = await Promise.all([
    fetchProducts(new URLSearchParams({ 
      brand: brand.id.toString(), 
      limit: '100' 
    })),
    fetchCategories()
  ]);


  // Client-side mapping & fallback logic (ensuring brand match)
  const brandProducts = allBrandProductsRaw.filter(p => 
    p.brandId?.toString() === brand.id.toString() || 
    (p.brandName && p.brandName.toLowerCase() === brand.name.toLowerCase())
  );

  const presentCategoryIds = new Set(brandProducts.map(p => p.categoryId?.toString()));
  const availableCategories = allCats.filter(c => presentCategoryIds.has(c.id.toString()));

  // JSON-LD Graph Construction
  const canonicalUrl = `https://saisatgurutextile.com/brand/${normalizeSlug(brand.slug || brand.name)}`;
  const faqs = buildFaqs(brand.name);
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `${brand.name} Collection`,
        url: canonicalUrl,
        description: `Wholesale ${brand.name} textiles from Surat.`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://saisatgurutextile.com' },
          { '@type': 'ListItem', position: 2, name: 'Brands', item: 'https://saisatgurutextile.com/brands' },
          { '@type': 'ListItem', position: 3, name: brand.name, item: canonicalUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      }
    ],
  };

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-36 pb-12 text-white animate-reveal">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/50 uppercase tracking-wider mb-4 md:mb-8">
          <Link href="/" className="hover:text-[#d4af37] transition-colors">Home</Link>
          <span className="text-white/20">/</span>
          <Link href="/brands" className="hover:text-[#d4af37] transition-colors">Brands</Link>
          <span className="text-white/20">/</span>
          <span className="text-[#d4af37] font-bold">{brand.name}</span>
        </div>

        {/* Client UI (Filtering / Sorting / Grid) */}
        <BrandLandingUI 
            brand={brand} 
            allProducts={brandProducts} 
            categories={availableCategories} 
        />

        {/* Server SEO Content Section */}
        <BrandSeoSection 
            brand={brand} 
            products={brandProducts} 
            categories={allCats} 
        />
      </div>
    </div>
  );
}
