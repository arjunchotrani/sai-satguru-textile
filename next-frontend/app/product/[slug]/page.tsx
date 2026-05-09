import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Phone, CheckCircle } from 'lucide-react';
import { ProductGallery } from '../../../components/ProductGallery';
import { ProductTabs } from '../../../components/ProductTabs';
import { ProductPrice } from '../../../components/ProductPrice';
import { ProductSeoSection } from '../../../components/ProductSeoSection';
import RelatedProducts, { RelatedProductsSkeleton } from '../../../components/RelatedProducts';
import { 
  fetchProductBySlug, 
  fetchCategories,
  fetchSubCategories,
  fetchProducts, 
  normalizeSlug 
} from '../../../lib/api';

import { 
  parseProductDescription, 
  buildProductSeoTitle, 
  buildProductSeoDesc, 
  isGenericProduct 
} from '../../../lib/product';
import { CONTACT_INFO } from '../../../lib/constants';
import { generateProductSchema, generateBreadcrumbSchema } from '../../../lib/schema';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  // Rule 3: Ensure SEO metadata is preserved even in lean mode.
  // Using lean=true here since metadata only needs basic fields.
  const product = await fetchProductBySlug(slug, true);
  
  if (!product) return {};

  const category = product.category || null;
  
  const title = buildProductSeoTitle(
    product.name, 
    product.brandName, 
    category?.label || category?.name
  );
  
  const description = buildProductSeoDesc(
    product.name, 
    product.brandName, 
    category?.label || category?.name, 
    product.description
  );

  return {
    title, // Layout template will append " | Sai Satguru Textile"
    description,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/product/${product.slug}`,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}


import { getCatalog } from '../../../lib/catalog';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const startTime = Date.now();
    
    // 1. Data Fetch: Targeted Product Detail + Shared Catalog Cache
    const fetchStart = Date.now();
    const [product, { categories: allCats, subCategories: allSubs }] = await Promise.all([
        fetchProductBySlug(slug, true),
        getCatalog()
    ]);
    const productDataFetchTime = Date.now() - fetchStart;
    
    if (!product) {
        notFound();
    }

    const details = parseProductDescription(product.description);
    const isBranded = !isGenericProduct(product.brandName);

    // 2. Resilience: Reconstruct Relations
    // Semantic match (Name-based) often fixes mis-tagged database records using the description as source of truth.
    const semanticCategory = details?.type 
        ? allCats.find(c => 
            c.name?.toLowerCase() === details.type.toLowerCase() || 
            c.label?.toLowerCase() === details.type.toLowerCase()
          ) 
        : null;

    const idCategory = allCats.find(c => c.id.toString() === product.categoryId?.toString());
    
    // Priority: Semantic Match > ID Match > Joined Backend Data
    const category = semanticCategory || idCategory || product.category || null;

    const subCategory = product.subCategory || 
      allSubs.find(s => s.id.toString() === product.subCategoryId?.toString()) || 
      null;







  // WhatsApp Inquiry Logic
  const currentUrl = `https://saisatgurutextile.com/product/${product.slug}`;
  const whatsappMessage = `Hello Sai Satguru Textiles,\n\nI am interested in the following product:\n\nProduct Name: ${product.name}\nBrand: ${product.brandName || 'N/A'}\nProduct Link: ${currentUrl}\n\nPlease share price, MOQ and availability.`;
  const whatsappLink = `https://wa.me/${CONTACT_INFO.whatsapp1}?text=${encodeURIComponent(whatsappMessage)}`;

  const isGenericBrand = (name: string | null | undefined) => 
    !name || ['generic', 'GENERIC', 'Generic'].includes(name.trim()) || name.trim() === '';

  // JSON-LD
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    ...(category ? [{ name: category.label || category.name || 'Category', item: `/category/${category.slug}` }] : []),
    ...(subCategory ? [{ name: subCategory.label || subCategory.name || 'Sub-Category', item: `/category/${category?.slug}/${subCategory.slug}` }] : []),
    { name: product.name, item: `/product/${product.slug}` }
  ]);
  const productSchema = generateProductSchema(
      product, 
      category?.label || category?.name, 
      product.brandName || undefined
  );

  return (
    <div className="bg-black w-full pt-[80px] pb-4 animate-reveal">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="container mx-auto px-4 lg:px-8">
        {/* Breadcrumb (Strict Legacy Parity) */}
        <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-white/50 uppercase tracking-wider mb-8 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar scroll-smooth w-full">
          <Link href="/" className="hover:text-[#d4af37] shrink-0 transition-colors">Home</Link>
          {category && (
            <>
              <span className="shrink-0 text-white/20">/</span>
              <Link href={`/category/${category.slug}`} className="hover:text-[#d4af37] shrink-0 transition-colors">
                {category.label || category.name}
              </Link>
            </>
          )}
          {subCategory && (
            <>
              <span className="shrink-0 text-white/20">/</span>
              <Link href={`/category/${category?.slug}/${subCategory.slug}`} className="hover:text-[#d4af37] shrink-0 transition-colors">
                {subCategory.label || subCategory.name}
              </Link>
            </>
          )}
          <span className="shrink-0 text-white/20">/</span>
          <span className="text-white font-bold shrink-0 pr-4">{product.name}</span>
        </div>

        {/* SECTION 1: GALLERY */}
        <ProductGallery images={product.images || []} productName={product.name} />

        {/* SECTION 2: HEADER */}
        <div className="w-full max-w-[900px] mx-auto text-center mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
             <span className="text-[#d4af37] text-[10px] uppercase tracking-widest font-bold">
              {category?.label || category?.name}
            </span>
            {product.brandName && (
              <>
                <span className="text-white/20 text-[10px]">•</span>
                {!isGenericBrand(product.brandName) ? (
                  <Link
                    href={`/brand/${normalizeSlug(product.brandSlug || product.brandName)}`}
                    className="text-white/60 hover:text-[#d4af37] text-[10px] uppercase tracking-widest font-bold transition-all"
                  >
                    {product.brandName}
                  </Link>
                ) : (
                  <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">
                    {product.brandName}
                  </span>
                )}
              </>
            )}
          </div>

          <h1 className="font-serif text-3xl md:text-5xl text-white mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-baseline justify-center gap-4 mb-8">
            <ProductPrice price={product.basePriceINR} className="text-3xl md:text-4xl font-bold text-[#d4af37]" />
          </div>

          <div className="flex justify-center mb-12">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-sm h-14 flex items-center justify-center gap-3 bg-[#d4af37] hover:bg-white text-black text-sm uppercase tracking-widest font-bold transition-all rounded-sm shadow-lg shadow-[#d4af37]/10"
            >
              <Phone size={18} />
              Ask On Whatsapp
            </a>
          </div>

          {/* TRUST BOX */}
          <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-6 mb-12 text-left">
            <h3 className="text-white font-serif text-lg mb-6 text-center">Why Sai Satguru Textile?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 max-w-2xl mx-auto">
               {[
                 { title: "Trusted by Wide Users", desc: "Across global markets" },
                 { title: "Global Logistics", desc: "Efficient worldwide shipping" },
                 { title: "Certified Quality", desc: "Premium grade textiles" },
                 { title: "Heritage Craft", desc: "Authentic traditional methods" }
               ].map((item, i) => (
                 <div key={i} className="flex items-start gap-3">
                   <CheckCircle className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                   <div className="flex flex-col">
                     <span className="text-sm text-white font-medium">{item.title}</span>
                     <span className="text-[10px] text-white/50">{item.desc}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* SECTION 4: PREMIUM PRODUCT DETAILS (STRICT LEGACY RESTORATION) */}
          <div className="border-t border-white/10 pt-8 text-left mb-12">
            <h3 className="text-2xl md:text-3xl font-serif text-white mb-6 text-center tracking-tight">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1000px] mx-auto">
              {/* Brand Card */}
              {product.brandName && !isGenericBrand(product.brandName) ? (
                <Link
                  href={`/brand/${normalizeSlug(product.brandSlug || product.brandName)}`}
                  className="bg-white/[0.04] border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center group hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 shadow-xl cursor-pointer hover:-translate-y-1 active:scale-[0.98]"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3 group-hover:text-[#d4af37] transition-colors">Brand</span>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">{product.brandName}</span>
                </Link>
              ) : (
                <div className="bg-white/[0.04] border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center shadow-xl cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3">Brand</span>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">{product.brandName || 'Generic'}</span>
                </div>
              )}

              {/* Category Card */}
              {category ? (
                <Link
                  href={`/category/${category.slug}`}
                  className="bg-white/[0.04] border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center group hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 shadow-xl cursor-pointer hover:-translate-y-1 active:scale-[0.98]"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3 group-hover:text-[#d4af37] transition-colors">Category</span>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">{category.label || category.name}</span>
                </Link>
              ) : (
                <div className="bg-white/[0.04] border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center shadow-xl cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3">Category</span>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">{details?.type || 'Suits'}</span>
                </div>
              )}
            </div>
          </div>

          {/* TABS & DETAILS */}

          {details && <ProductTabs details={details} />}
        </div>

        {/* SEO SECTIONS & RELATED */}
        <div className="w-full max-w-[900px] mx-auto mt-4 px-2 pb-16">
          <ProductSeoSection 
            product={product} 
            category={category} 
          />

          <Suspense fallback={<RelatedProductsSkeleton />}>
            <RelatedProducts 
                categoryId={product.categoryId}
                brandId={product.brandId}
                isBranded={isBranded}
                currentProductId={product.id}
                brandName={product.brandName}
                categoryLabel={category?.label || category?.name}
            />
          </Suspense>
        </div>

      </div>
    </div>
  );
}
