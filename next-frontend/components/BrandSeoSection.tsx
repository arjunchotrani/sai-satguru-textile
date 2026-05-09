import React from 'react';
import Link from 'next/link';
import { Brand, Product, Category } from '../lib/types';

interface BrandSeoSectionProps {
  brand: Brand;
  products: Product[];
  categories: Category[];
}

function deriveCategories(products: Product[], categories: Category[]): Category[] {
  const presentIds = new Set(products.map(p => p.categoryId?.toString()));
  return categories.filter(c => presentIds.has(c.id.toString()));
}

export function buildFaqs(brandName: string): { q: string; a: string }[] {
  return [
    {
      q: `What products are available under ${brandName} at Sai Satguru Textile?`,
      a: `Sai Satguru Textile offers a curated collection of wholesale textile products from ${brandName}, including catalogue sets, ethnic wear, and related styles. Browse the full collection above or contact us via WhatsApp for the latest availability.`,
    },
    {
      q: `Can I enquire about ${brandName} products through WhatsApp?`,
      a: `Yes. You can reach our sales team directly on WhatsApp to enquire about pricing, minimum order quantities, and current availability for any ${brandName} product listed on our platform.`,
    },
    {
      q: `Does Sai Satguru Textile offer brand-wise product browsing?`,
      a: `Yes. Sai Satguru Textile provides dedicated brand collection pages so wholesale buyers and retailers can conveniently browse all products from a specific brand in one place, making catalogue discovery and sourcing easier.`,
    },
    {
      q: `How can I explore more products from ${brandName}?`,
      a: `Use the category filters above the product grid to narrow down the ${brandName} collection by type. You can also browse all brands at Sai Satguru Textile to discover similar or related collections.`,
    },
  ];
}

export const BrandSeoSection: React.FC<BrandSeoSectionProps> = ({
  brand,
  products,
  categories,
}) => {
  const brandCategories = deriveCategories(products, categories);
  const faqs = buildFaqs(brand.name);
  const totalCount = products.length;
  const categoryNames = brandCategories.map(c => c.label || c.name || '').filter(Boolean);

  const categorySnippet =
    categoryNames.length > 0
      ? ` across ${categoryNames.length === 1
          ? `the ${categoryNames[0]} range`
          : `categories including ${categoryNames.slice(0, 3).join(', ')}${categoryNames.length > 3 ? ', and more' : ''}`}`
      : '';

  return (
    <div className="mt-20 border-t border-white/10 pt-16 space-y-14">
      <section aria-labelledby="brand-about-heading">
        <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">About the Brand</span>
        <h2 id="brand-about-heading" className="font-serif text-2xl md:text-3xl text-white mb-6">About {brand.name}</h2>
        <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-3xl">
          Sai Satguru Textile provides a dedicated brand collection page for <strong className="text-white/80">{brand.name}</strong>, curating {totalCount > 0 ? `${totalCount} wholesale textile product${totalCount !== 1 ? 's' : ''}` : 'a curated range of wholesale textile products'}{categorySnippet}.
          This page is intended to support catalogue-style discovery and enquiry-led wholesale sourcing for retailers, boutique owners, and wholesale buyers. Browse the full {brand.name} collection above, or use the category filter to narrow your search.
          For pricing, availability, and minimum order details, you can reach our team directly via WhatsApp.
        </p>
      </section>

      <section aria-labelledby="brand-why-heading">
        <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">Sourcing Made Simple</span>
        <h2 id="brand-why-heading" className="font-serif text-2xl md:text-3xl text-white mb-6">Why Explore {brand.name} at Sai Satguru Textile</h2>
        <ul className="space-y-3 text-white/60 text-sm md:text-base">
          {[
            "Dedicated Brand Browsing — All " + brand.name + " products are grouped under one collection page for faster discovery and comparison.",
            "Direct Enquiry Support — Reach our team on WhatsApp for the most up-to-date pricing, GST details, and dispatch timelines for any " + brand.name + " item.",
            "Single-Page Product Visibility — Find all available styles, sets, and variants from this brand without navigating across multiple catalogue sections.",
            "Wholesale Catalogue Discovery — Designed for wholesale buyers, boutique stockists, and retailers who prefer structured, brand-wise sourcing directly from Surat."
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#d4af37]/70 shrink-0" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {brandCategories.length > 0 && (
        <section aria-labelledby="brand-categories-heading">
          <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">Product Types</span>
          <h2 id="brand-categories-heading" className="font-serif text-2xl md:text-3xl text-white mb-6">Available Categories Under {brand.name}</h2>
          <ul className="flex flex-wrap gap-3">
            {brandCategories.map(cat => (
              <li key={cat.id}>
                {cat.slug ? (
                  <Link href={`/category/${cat.slug}`} className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 text-xs uppercase tracking-wider font-bold hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-all duration-300">
                    {cat.label || cat.name}
                  </Link>
                ) : (
                  <span className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs uppercase tracking-wider font-bold">{cat.label || cat.name}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="brand-faq-heading">
        <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">Common Questions</span>
        <h2 id="brand-faq-heading" className="font-serif text-2xl md:text-3xl text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3 max-w-3xl">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group border border-white/10 rounded-lg bg-white/[0.02] open:bg-white/[0.04] transition-colors duration-300">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none text-white/80 text-sm font-medium hover:text-white transition-colors duration-200">
                <span>{faq.q}</span>
                <span className="ml-4 shrink-0 w-5 h-5 flex items-center justify-center rounded-full border border-white/20 text-[#d4af37]/80 text-xs font-bold group-open:rotate-45 transition-transform duration-300">+</span>
              </summary>
              <p className="px-5 pb-4 pt-1 text-white/55 text-sm leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-label="Browse all brands" className="flex items-center gap-4 pt-2 pb-2">
        <div className="h-px flex-grow bg-white/10" />
        <Link href="/brands" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-white/40 hover:text-[#d4af37] transition-colors">
          <span>Browse All Brands</span>
          <span className="text-[#d4af37]">→</span>
        </Link>
        <div className="h-px flex-grow bg-white/10" />
      </section>
    </div>
  );
};
