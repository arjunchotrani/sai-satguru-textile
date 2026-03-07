import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { ChevronRight, Filter, ChevronDown, AlignLeft, X } from 'lucide-react';
import { useCategories, useSubCategories, useProducts, useBrands } from "../hooks/useProducts";

import type { Category, SubCategory } from '../types';

export const SubCategoryPage: React.FC = () => {
  const { categorySlug, subSlug } = useParams<{ categorySlug: string, subSlug: string }>();

  // Filter State
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    ? { category_id: category.id, sub_category_id: subCategory.id, limit: 100, includeImages: true }
    : undefined;

  const { data: products = [], isLoading: productsLoading } = useProducts(filter || {});

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
              {filteredProducts.length > 0 && ` Showing ${filteredProducts.length} items.`}
            </p>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 mt-6 md:mt-0 ${isFilterOpen
              ? 'bg-brand-gold text-black border-brand-gold'
              : 'bg-white/5 text-white border-white/10 hover:border-brand-gold/50'
              }`}
          >
            <Filter size={16} />
            <span className="text-xs uppercase tracking-widest font-bold">Filters</span>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Panel (Mobile Drawer + Desktop Expand) */}
        <div className={`
            fixed inset-0 z-[100] md:static md:z-auto bg-black/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none transition-opacity duration-300
            ${isFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none md:max-h-0 md:mb-0'}
        `}>
          <div className={`
                fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 p-6 rounded-t-2xl shadow-2xl
                md:static md:bg-white/5 md:border md:rounded-sm md:p-8 md:mb-12 md:shadow-none
                transition-transform duration-300 ease-out
                ${isFilterOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
            `}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-white">Filter by Brand</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors md:hidden"
              >
                <X size={20} className="text-white" />
              </button>
              <button
                onClick={() => setSelectedBrands(new Set())}
                className="hidden md:block text-xs text-white/40 hover:text-white underline decoration-white/30 tracking-widest uppercase"
              >
                Clear All
              </button>
            </div>

            {availableBrands.length > 0 ? (
              <div className="flex flex-wrap gap-3 max-h-[60vh] overflow-y-auto md:max-h-none">
                {availableBrands.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => toggleBrand(brand.id)}
                    className={`px-4 py-3 md:py-2 text-xs uppercase tracking-widest border rounded-lg md:rounded-none transition-all duration-300 ${selectedBrands.has(brand.id)
                      ? 'bg-brand-gold text-black border-brand-gold font-bold'
                      : 'bg-black/50 md:bg-transparent text-white/60 border-white/10 hover:border-brand-gold/50 hover:text-white'
                      }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border border-dashed border-white/10 rounded-lg">
                <p className="text-white/40 text-sm italic">No brands available for this collection.</p>
              </div>
            )}

            {/* Mobile Actions */}
            <div className="mt-8 flex gap-4 md:hidden">
              <button
                onClick={() => setSelectedBrands(new Set())}
                className="flex-1 py-3 border border-white/10 rounded-full text-xs uppercase tracking-widest text-white/70"
              >
                Clear
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 bg-brand-gold text-black rounded-full text-xs uppercase tracking-widest font-bold shadow-lg"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>

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
        </div>
      </div>
    </div>
  );
};