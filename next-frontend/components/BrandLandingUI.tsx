'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import { Product, Category, Brand } from '../lib/types';
import { ProductCard } from './ProductCard';

interface BrandLandingUIProps {
  brand: Brand;
  allProducts: Product[];
  categories: Category[];
}

export const BrandLandingUI: React.FC<BrandLandingUIProps> = ({ brand, allProducts, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState("latest");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Logic
  const filteredProducts = useMemo(() => {
    const result = allProducts.filter(p => {
      const matchesCategory = !selectedCategory || p.categoryId?.toString() === selectedCategory;
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price_asc') result.sort((a, b) => a.basePriceINR - b.basePriceINR);
    else if (sortBy === 'price_desc') result.sort((a, b) => b.basePriceINR - a.basePriceINR);
    
    return result;
  }, [allProducts, selectedCategory, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (searchQuery ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortBy('latest');
    setCurrentPage(1);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 border-b border-white/10 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-2xl text-left">
          <span className="text-[#d4af37] text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Brand Collection</span>
          <h1 className="font-serif text-3xl md:text-6xl text-white mb-2 md:mb-4">{brand.name}</h1>
          <p className="text-white/60 text-xs md:text-base font-light tracking-wide leading-relaxed">
            {filteredProducts.length} Premium Product{filteredProducts.length !== 1 && 's'} Available
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto mt-6 md:mt-0">
          <div className="relative w-full md:w-auto flex-1 md:flex-none">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none bg-white/5 text-white border border-white/10 px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold focus:outline-none focus:border-[#d4af37]/50 transition-all cursor-pointer pr-10"
            >
              <option value="latest" className="bg-[#111]">Latest</option>
              <option value="price_asc" className="bg-[#111]">Price: Low to High</option>
              <option value="price_desc" className="bg-[#111]">Price: High to Low</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 relative z-40 ${isDrawerOpen ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-white/5 text-white border-white/10 hover:border-[#d4af37]/50'}`}
          >
            <Filter size={16} />
            <span className="text-xs uppercase tracking-widest font-bold">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 w-5 h-5 bg-[#d4af37] text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">{activeFiltersCount}</span>
            )}
            <ChevronDown size={14} className={`transition-transform duration-300 ${isDrawerOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Drawer Portal */}
      {isDrawerOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#050505] shadow-2xl transition-transform duration-500 border-l border-white/5 p-6 md:p-12 flex flex-col h-full overflow-y-auto">
             <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-serif text-[#d4af37]">Filters</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-3 bg-white/5 rounded-full hover:bg-[#d4af37] hover:text-black transition-all">
                  <X size={24} />
                </button>
             </div>

             <div className="space-y-12">
               {/* Search */}
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Search</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search within brand..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-[#d4af37]/40 outline-none"
                    />
                    <Search size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20" />
                  </div>
               </div>

               {/* Categories */}
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Categories</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
                      className={`text-left px-5 py-3 rounded-xl border transition-all ${selectedCategory === '' ? 'bg-[#d4af37]/10 border-[#d4af37]/40 text-[#d4af37]' : 'bg-white/5 border-white/5 text-white/50 hover:border-white/20'}`}
                    >
                      All Categories
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.id.toString()); setCurrentPage(1); }}
                        className={`text-left px-5 py-3 rounded-xl border transition-all ${selectedCategory === cat.id.toString() ? 'bg-[#d4af37]/10 border-[#d4af37]/40 text-[#d4af37]' : 'bg-white/5 border-white/5 text-white/50 hover:border-white/20'}`}
                      >
                        {cat.label || cat.name}
                      </button>
                    ))}
                  </div>
               </div>
             </div>

             <div className="mt-auto pt-12 space-y-4">
               {activeFiltersCount > 0 && (
                 <button onClick={clearAllFilters} className="w-full text-[10px] text-white/30 hover:text-[#d4af37] uppercase tracking-[0.4em] font-black">Reset All</button>
               )}
               <button onClick={() => setIsDrawerOpen(false)} className="w-full py-5 bg-[#d4af37] text-black rounded-xl font-bold uppercase tracking-widest text-xs">Apply Filters</button>
             </div>
          </div>
        </div>,
        document.body
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 mt-12 animate-in fade-in duration-1000">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 mb-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
             <button
                key={p}
                onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-10 h-10 rounded-full text-xs font-bold border transition-all ${currentPage === p ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-lg shadow-[#d4af37]/30' : 'bg-white/5 border-white/10 text-white/40 hover:border-[#d4af37]/50 hover:text-white'}`}
             >
               {p}
             </button>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="py-32 text-center border-t border-white/10 mt-12">
          <h3 className="font-serif text-2xl mb-3 text-white/80">No products found</h3>
          <p className="text-white/40 mb-8 max-w-sm mx-auto">Try adjusting your filters or search query.</p>
          <button onClick={clearAllFilters} className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#d4af37] text-black rounded-full font-bold text-sm">Clear Filters</button>
        </div>
      )}
    </>
  );
};
