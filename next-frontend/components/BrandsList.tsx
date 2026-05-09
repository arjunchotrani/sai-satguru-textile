'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Brand } from '../lib/types';

interface BrandsListProps {
  initialBrands: Brand[];
}

export const BrandsList: React.FC<BrandsListProps> = ({ initialBrands }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBrands = useMemo(() => {
    if (!searchQuery) return initialBrands;
    const lowerQ = searchQuery.toLowerCase();
    return initialBrands.filter(b => b.name.toLowerCase().includes(lowerQ));
  }, [initialBrands, searchQuery]);

  // Group by first letter
  const groupedBrands = useMemo(() => {
    const groups: Record<string, Brand[]> = {};
    filteredBrands.forEach(brand => {
      const letter = brand.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(brand);
    });
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
      return acc;
    }, {} as Record<string, Brand[]>);
  }, [filteredBrands]);

  return (
    <div className="animate-in fade-in duration-700">
      {/* Search Bar */}
      <div className="mt-12 relative max-w-md mx-auto group mb-20">
        <input
          type="text"
          placeholder="Search brands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-b border-white/20 py-4 pl-12 pr-4 text-lg font-serif text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-all text-center focus:text-left"
        />
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#d4af37] transition-colors duration-300 pointer-events-none" size={20} strokeWidth={1.5} />
      </div>

      {filteredBrands.length === 0 ? (
        <div className="py-24 text-center text-white/30">
          <p className="text-xl font-serif italic">No brands found matching &quot;{searchQuery}&quot;.</p>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(groupedBrands).map(([letter, brandList]) => (
            <div key={letter} className="relative group/letter">
              {/* Letter Watermark */}
              <div className="absolute -top-8 -left-4 md:-left-12 opacity-5 select-none text-[6rem] md:text-[10rem] font-serif font-bold text-white leading-none pointer-events-none group-hover/letter:opacity-10 transition-opacity duration-700">
                {letter}
              </div>

              <div className="flex items-center gap-6 mb-8 relative z-10 pl-4 md:pl-0">
                <span className="text-[#d4af37] font-serif text-2xl md:text-3xl">{letter}</span>
                <div className="h-px bg-white/10 flex-grow"></div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 relative z-10">
                {brandList.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.slug}`}
                    className="group relative p-6 md:p-8 bg-white/5 border border-white/5 hover:border-[#d4af37]/30 transition-all duration-500 hover:bg-white/10 overflow-hidden flex flex-col items-center justify-center text-center aspect-[5/3] md:aspect-[4/3] rounded-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/0 via-transparent to-[#d4af37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#d4af37] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                    <div className="relative z-10 space-y-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                      <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-white/80 group-hover:text-[#d4af37] transition-colors duration-300">
                        {brand.name}
                      </h3>
                    </div>

                    <div className="absolute bottom-6 left-0 right-0 text-center opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-medium">View Collection</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
