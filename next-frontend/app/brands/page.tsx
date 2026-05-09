export const runtime = 'edge';
import React from 'react';
import { fetchBrands } from '../../lib/api';
import { BrandsList } from '../../components/BrandsList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Textile Brands',
  description: 'Browse all available textile brands at Sai Satguru Textile. Explore brand-wise collections, catalogue products, and enquiry-based wholesale sourcing from Surat.',
  alternates: {
    canonical: 'https://saisatgurutextile.com/brands',
  },
};

export default async function BrandsPage() {
  const allBrands = await fetchBrands();
  const activeBrands = allBrands.filter(b => b.is_active !== false);

  return (
    <div className="bg-black min-h-screen pt-32 pb-24 text-white">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="text-center mb-10 max-w-4xl mx-auto">
          <span className="text-[#d4af37] text-xs font-bold tracking-[0.3em] uppercase mb-4 block animate-fade-in">
            Excellence in Textiles
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-8 animate-fade-in-up">
            Our Brands
          </h1>
          <div className="h-px w-24 bg-[#d4af37] mx-auto mb-8 opacity-50"></div>
          <p className="text-white/60 text-lg font-light tracking-wide max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            Discover a curated selection of India&apos;s finest textile manufacturers, chosen for their quality, heritage, and innovation.
          </p>
        </div>

        {/* Client Brands List (Searchable/Grouped) */}
        <BrandsList initialBrands={activeBrands} />

        {/* SEO Content Footer */}
        <div className="mt-20 pt-14 border-t border-white/10 text-center max-w-2xl mx-auto opacity-60">
          <p className="text-white/40 text-sm leading-relaxed">
            Sai Satguru Textile provides brand-wise collection pages so wholesale 
            buyers, boutique owners, and retail stockists can browse products from 
            a specific brand in one place. Each brand page supports catalogue-style 
            discovery and direct WhatsApp enquiry for pricing, availability, and 
            sourcing support — all from Surat, Gujarat.
          </p>
        </div>
      </div>
    </div>
  );
}
