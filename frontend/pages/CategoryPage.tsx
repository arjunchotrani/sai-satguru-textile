import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { ProductCard } from "../components/ProductCard";
import { ChevronLeft, ChevronRight, Filter, X, ChevronDown } from "lucide-react";
import { usePaginatedProducts, useCategories, useBrands } from "../hooks/useProducts";

import type { Category, Brand, Product } from "../types";

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 1. Fetch Categories to find the current one
  const { data: categories } = useCategories();

  const isAllCollections = slug === "all";

  let matchedCategory: Category | undefined;
  if (categories && !isAllCollections) {
    matchedCategory = categories.find(
      (c: Category) =>
        c.slug === slug || (c.name && c.name.toLowerCase() === slug) || (c.label && c.label.toLowerCase() === slug)
    );
  }

  const title = isAllCollections
    ? "All Collections"
    : matchedCategory?.label || matchedCategory?.name || "Collection";

  // 2. Fetch Products (React Query handles caching & background updates)
  const filter = matchedCategory
    ? { category_id: matchedCategory.id, limit: PAGE_SIZE, page: currentPage, sort: sortBy }
    : { limit: PAGE_SIZE, page: currentPage, sort: sortBy };

  const {
    data: productsData,
    isLoading: productsLoading,
  } = usePaginatedProducts(filter);

  const products = productsData?.products || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  // 🔹 Reset page on category or filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [slug, selectedBrands, sortBy]);

  // 🔹 Scroll to top on page change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // 3. Fetch Brands
  const { data: allBrands = [] } = useBrands();

  // 4. Derive Available Brands from Products (Memoized by React Query if needed, but fast enough here)
  const productBrandIds = new Set(
    products
      .map(p => String(p.brandId || ''))
      .filter(id => id !== '' && id !== 'undefined' && id !== 'null')
  );

  const availableBrands = allBrands.filter(b => productBrandIds.has(String(b.id)));
  availableBrands.sort((a, b) => a.name.localeCompare(b.name));

  // 5. Client-side Filtering
  const filteredProducts = products.filter(p => {
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
        title={`${title} | Sai Satguru Textile`}
        description={`Shop our exclusive ${title} collection. Wholesale prices and premium quality.`}
      />

      <div className="container mx-auto px-6 md:px-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/50 uppercase tracking-widest mb-8 md:mb-12 animate-fade-in">
          <Link to="/" className="hover:text-brand-gold transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-brand-gold font-bold">{title}</span>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 border-b border-white/10 pb-8 animate-fade-in-up">
          <div className="max-w-2xl text-left">
            <span className="text-brand-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block">
              Exclusive Collection
            </span>
            <h1 className="font-serif text-3xl md:text-6xl text-white mb-2 md:mb-4">
              {title}
            </h1>
            <p className="text-white/60 text-xs md:text-base font-light tracking-wide leading-relaxed">
              {totalProducts} Premium {totalProducts === 1 ? 'Product' : 'Products'} Available
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
 
        {/* Transparent Brand Filter Section (Always Visible) */}
        {availableBrands.length > 0 && (
          <div className="mb-12 animate-fade-in-up delay-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Shop by Brand</h3>
              <button
                onClick={() => setSelectedBrands(new Set())}
                className="text-[10px] text-white/30 hover:text-brand-gold underline decoration-white/10 tracking-widest uppercase transition-colors"
                title="Clear Filters"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {availableBrands.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => toggleBrand(brand.id)}
                  className={`px-4 py-2 md:py-2 text-[10px] md:text-xs uppercase tracking-widest border rounded-full transition-all duration-300 ${selectedBrands.has(brand.id)
                    ? 'bg-brand-gold text-black border-brand-gold font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'bg-white/5 text-white/60 border-white/10 hover:border-brand-gold/50 hover:text-white'
                    }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product Grid Container */}
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-white/5 mb-4" />
                  <div className="h-4 bg-white/5 w-2/3 mb-2" />
                  <div className="h-4 bg-white/5 w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={idx < 4}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 bg-white/[0.02] rounded-sm">
              <p className="text-white/30 uppercase tracking-[0.2em] text-xs">No products found for this selection</p>
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

export default CategoryPage;
