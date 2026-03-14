import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { ChevronLeft, ChevronRight, Filter, ChevronDown, AlignLeft, X } from 'lucide-react';
import { useCategories, useSubCategories, usePaginatedProducts, useBrands } from "../hooks/useProducts";

import type { Category, SubCategory, Product } from '../types';

export const SubCategoryPage: React.FC = () => {
  const { categorySlug, subSlug } = useParams<{ categorySlug: string, subSlug: string }>();

  // Filter State
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 1. Fetch Categories to find the current one
  const { data: categories } = useCategories();

  const category = categories?.find((c: Category) =>
    c.slug === categorySlug ||
    (c.slug && c.slug.toLowerCase() === categorySlug?.toLowerCase()) ||
    (c.name && c.name.toLowerCase() === categorySlug?.toLowerCase())
  ) || null;

  // 2. Fetch Sub-categories
  const { data: subCategories } = useSubCategories(category?.id);

  const subCategory = subCategories?.find((s: SubCategory) => s.slug === subSlug) || null;

  // 3. Fetch Products (React Query)
  const filter = category && subCategory
    ? { category_id: category.id, sub_category_id: subCategory.id, limit: PAGE_SIZE, page: currentPage, sort: sortBy }
    : undefined;

  const {
    data: productsData,
    isLoading: productsLoading,
  } = usePaginatedProducts(filter || {});

  const products = productsData?.products || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  // 🔹 Reset page on category or filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, subSlug, selectedBrands, sortBy]);

  // 🔹 Scroll to top on page change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // 4. Fetch Brands
  const { data: allBrands = [] } = useBrands();

  // 5. Derive Available Brands
  const productBrandIds = new Set(
    products
      .map(p => String(p.brandId || ''))
      .filter(id => id !== '' && id !== 'undefined' && id !== 'null')
  );

  const availableBrands = allBrands.filter(b => productBrandIds.has(String(b.id)));
  availableBrands.sort((a, b) => a.name.localeCompare(b.name));

  // 6. Client-side Filtering
  const filteredProducts = products.filter(p => {
    // Double check sub-category match (though API should handle it)
    if (subCategory && String(p.subCategoryId) !== String(subCategory.id)) return false;

    if (selectedBrands.size === 0) return true;
    if (!p.brandId) return selectedBrands.has('generic');
    return selectedBrands.has(p.brandId);
  });

  const toggleBrand = (brandId: string) => {
    const next = new Set(selectedBrands);
    if (next.has(brandId)) {
      next.delete(brandId);
    } else {
      next.add(brandId);
    }
    setSelectedBrands(next);
  };

  const loading = productsLoading && products.length === 0;

  return (
    <div className="bg-black min-h-screen pt-32 pb-24 text-white">
      <SEO
        title={`${subCategory?.label || subCategory?.name || 'Collection'} | Sai Satguru Textile`}
        description={`Shop ${subCategory?.label || subCategory?.name} from our ${category?.label || category?.name} collection. Best wholesale prices.`}
      />
      <div className="container mx-auto px-6 md:px-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/50 uppercase tracking-widest mb-8 md:mb-12 animate-fade-in">
          <Link to="/" className="hover:text-brand-gold">Home</Link>
          <ChevronRight size={10} />
          {category && (
            <>
              <Link to={`/category/${category.slug}`} className="hover:text-brand-gold transition-colors">
                {category.label || category.name}
              </Link>
              <ChevronRight size={10} />
            </>
          )}
          <span className="text-brand-gold font-bold">{subCategory?.label || subCategory?.name}</span>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 border-b border-white/10 pb-8 animate-fade-in-up">
          <div className="max-w-2xl">
            <span className="text-brand-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block flex items-center gap-2">
              <AlignLeft size={14} /> Sub-Collection
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-white mb-4 uppercase">
              {subCategory?.label || subCategory?.name}
            </h1>
            <p className="text-white/60 text-sm md:text-base font-light tracking-wide leading-relaxed">
              Part of our premium <span className="text-white font-medium">{category?.label || category?.name}</span> collection.
              {totalProducts > 0 && ` Showing ${totalProducts} items.`}
            </p>
          </div>
 
          <div className="flex items-center gap-3 w-full md:w-auto mt-6 md:mt-0">
            {/* Sort Dropdown - Restored */}
            <div className="relative flex-1 md:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-white/5 text-white border border-white/10 px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold focus:outline-none focus:border-brand-gold/50 transition-all cursor-pointer pr-10"
              >
                <option value="latest" className="bg-[#111]">Latest</option>
                <option value="price_asc" className="bg-[#111]">Price: Low to High</option>
                <option value="price_desc" className="bg-[#111]">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
            </div>
          </div>
        </div>
 
        {/* Horizontal Brand Filter Bar (Always Visible & Compact) */}
        {availableBrands.length > 0 && (
          <div className="mb-10 animate-fade-in-up delay-100">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Filter by Brand</h3>
              {selectedBrands.size > 0 && (
                <button
                  onClick={() => setSelectedBrands(new Set())}
                  className="text-[10px] text-brand-gold hover:text-white underline decoration-brand-gold/30 tracking-widest uppercase transition-all"
                >
                  Clear ({selectedBrands.size})
                </button>
              )}
            </div>
            
            <div className="relative group">
              <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar scroll-smooth">
                {availableBrands.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => toggleBrand(brand.id)}
                    className={`flex-none px-5 py-2 text-[10px] md:text-xs uppercase tracking-widest border rounded-full transition-all duration-300 whitespace-nowrap ${selectedBrands.has(brand.id)
                      ? 'bg-brand-gold text-black border-brand-gold font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'bg-white/5 text-white/60 border-white/10 hover:border-brand-gold/50 hover:text-white'
                      }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
              {/* Subtle fade edges for horizontal scroll */}
              <div className="absolute top-0 right-0 h-[calc(100%-1rem)] w-12 bg-gradient-to-l from-black to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 left-0 h-[calc(100%-1rem)] w-12 bg-gradient-to-r from-black to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="w-full">
          {loading ? (
            <div className="py-32 text-center">
              <div className="w-12 h-12 border border-white/10 border-t-brand-gold rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/30 uppercase tracking-[0.2em] text-xs animate-pulse">Loading Collection...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-fade-in-up delay-100">
              {filteredProducts.map((p, index) => (
                <ProductCard key={p.id} product={p} priority={index < 5} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-white/40 border border-white/5 rounded-lg bg-white/5 mx-4">
              <p className="text-lg mb-4 font-serif italic">No products found in this sub-collection yet.</p>
              <Link to={`/category/${category?.slug}`} className="inline-block mt-6 text-brand-gold text-xs tracking-widest uppercase hover:underline">
                Back to {category?.label || category?.name}
              </Link>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-20 flex items-center justify-center gap-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-brand-gold disabled:opacity-20 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <div className="flex gap-4">
                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    if (currentPage <= 4) {
                      pages.push(1, 2, 3, 4, 5, '...', totalPages);
                    } else if (currentPage >= totalPages - 3) {
                      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                    }
                  }

                  return pages.map((p, i) => (
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-[10px] text-white/50">
                        ...
                      </span>
                    ) : (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(p as number)}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${currentPage === p
                          ? "border-brand-gold text-brand-gold bg-brand-gold/10"
                          : "border-white/10 text-white/30 hover:border-white/30"
                          }`}
                      >
                        {p}
                      </button>
                    )
                  ));
                })()}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-brand-gold disabled:opacity-20 disabled:pointer-events-none transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};