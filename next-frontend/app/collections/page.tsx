export const runtime = 'edge';
import React from 'react';
import Link from 'next/link';
import { fetchCategories } from '../../lib/api';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Textile Collections',
  description: 'Explore our complete range of premium wholesale textiles including Sarees, Lehengas, Kurtis, and more from Surat.',
  alternates: {
    canonical: 'https://saisatgurutextile.com/collections',
  },
};

export default async function CollectionsPage() {
  const categories = await fetchCategories();
  const activeCategories = categories.filter(c => c.is_active !== false);

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-36 pb-12 text-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="text-[#d4af37] text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Curated Excellence</span>
          <h1 className="font-serif text-4xl md:text-6xl mb-6">Our Collections</h1>
          <p className="text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
            Discover a legacy of craftsmanship. Browse our extensive range of traditional and contemporary textiles sourced directly from the heart of Surat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeCategories.map((category, i) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-sm block bg-neutral-950 border border-white/5 animate-in fade-in duration-700 fill-mode-backwards"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {category.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                />
              ) : (
                <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-white/10 uppercase tracking-[0.3em] text-[10px]">
                  {category.name}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8 md:p-10">
                <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">Wholesale</span>
                <h2 className="font-serif text-2xl md:text-4xl text-white mb-4 group-hover:text-[#d4af37] transition-colors duration-500">{category.name}</h2>
                <div className="flex items-center gap-3 text-white text-[10px] uppercase tracking-widest font-bold opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-100">
                  <span>Explore Collection</span>
                  <div className="w-8 h-px bg-white group-hover:w-12 transition-all duration-500"></div>
                  <ArrowRight size={14} />
                </div>
              </div>
              
              <div className="absolute top-0 left-0 w-full h-full border border-[#d4af37]/0 group-hover:border-[#d4af37]/20 transition-all duration-700 pointer-events-none"></div>
            </Link>
          ))}
        </div>
        
        {activeCategories.length === 0 && (
            <div className="py-24 text-center text-white/20 uppercase tracking-[0.3em] text-xs">
                No active collections found.
            </div>
        )}
      </div>
    </div>
  );
}
