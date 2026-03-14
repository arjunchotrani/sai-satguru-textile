import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { ChevronRight, Filter, ChevronDown, X, Search, AlignLeft, ChevronLeft } from 'lucide-react';
import { useCategories, usePaginatedProducts, useBrands, useProducts, useSubCategories } from "../hooks/useProducts";
import type { Category, Brand } from '../types';

export const SubCategoryPage: React.FC = () => {
    const { categorySlug, subCategorySlug } = useParams<{ categorySlug: string; subCategorySlug: string }>();

    // 🔹 Filter & UI States
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [sortBy, setSortBy] = useState("latest");
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 12;

    // 1. Fetch Categories and SubCategories
    const { data: categories } = useCategories();
    const category = categories?.find(c => c.slug === categorySlug) || null;
    const { data: subCategories } = useSubCategories(category?.id);
    const subCategory = subCategories?.find(s => s.slug === subCategorySlug) || null;

    const title = subCategory?.label || subCategory?.name || 'Collection';

    // 2. Fetch Products for current page (Server-side Filtered)
    const filter = subCategory
        ? {
            sub_category_id: subCategory.id,
            limit: PAGE_SIZE,
            page: currentPage,
            sort: sortBy,
            brand_id: selectedBrand || undefined,
            search: searchQuery || undefined
        }
        : {};

    const {
        data: productsData,
        isLoading: productsLoading,
    } = usePaginatedProducts(filter);

    const products = productsData?.products || [];
    const totalProducts = productsData?.total || 0;
    const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

    // 3. Fetch Brands for SubCategory Brand-Counts
    const { data: subCategoryProducts = [] } = useProducts(subCategory ? { sub_category_id: subCategory.id, limit: 1000 } : {});
    const { data: allBrands = [] } = useBrands();

    // Derive brand counts
    const brandCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        subCategoryProducts.forEach(p => {
            if (p.brandId) counts[p.brandId] = (counts[p.brandId] || 0) + 1;
        });
        return counts;
    }, [subCategoryProducts]);

    const availableBrands = allBrands
        .filter(b => brandCounts[b.id] > 0)
        .sort((a, b) => a.name.localeCompare(b.name));

    // Reset page on filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [subCategorySlug, selectedBrand, sortBy, searchQuery]);

    // Scroll to top
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage]);

    const resetFilters = () => {
        setSelectedBrand('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const loading = productsLoading && products.length === 0;

    return (
        <div className="bg-black min-h-screen pt-32 pb-24 text-white">
            <SEO
                title={`${title} | Sai Satguru Textile`}
                description={`Browse our premium ${title} collection. Wholesale prices on luxury textiles.`}
            />
            <div className="container mx-auto px-6 md:px-12 text-left">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/50 uppercase tracking-widest mb-8 md:mb-12 animate-fade-in">
                    <Link to="/" className="hover:text-brand-gold transition-colors">Home</Link>
                    <ChevronRight size={10} />
                    <Link to={`/category/${categorySlug}`} className="hover:text-brand-gold transition-colors">{category?.label || category?.name}</Link>
                    <ChevronRight size={10} />
                    <span className="text-brand-gold font-bold">{title}</span>
                </div>

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 border-b border-white/10 pb-8 animate-fade-in-up">
                    <div className="max-w-2xl text-left">
                        <span className="text-brand-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block flex items-center gap-2">
                            <AlignLeft size={14} /> Premium Collection
                        </span>
                        <h1 className="font-serif text-3xl md:text-6xl text-white mb-2 md:mb-4 uppercase">
                            {title}
                        </h1>
                        <p className="text-white/60 text-xs md:text-base font-light tracking-wide leading-relaxed">
                            {totalProducts} Items Available
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto mt-6 md:mt-0">
                        {/* Sort Dropdown */}
                        <div className="relative w-full md:w-auto">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full appearance-none bg-white/5 text-white border border-white/10 px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:border-brand-gold/50 transition-all cursor-pointer pr-12"
                            >
                                <option value="latest" className="bg-[#111]">Latest Arrivals</option>
                                <option value="price_asc" className="bg-[#111]">Price: Low to High</option>
                                <option value="price_desc" className="bg-[#111]">Price: High to Low</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-3 rounded-full bg-brand-gold text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-gold/20"
                        >
                            <Filter size={16} />
                            Filters
                            {(selectedBrand || searchQuery) && (
                                <span className="bg-black text-brand-gold w-5 h-5 rounded-full flex items-center justify-center text-[8px] border border-black/10">!</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* 🔹 Sidebar Filter Drawer (Portaled) */}
                {typeof document !== 'undefined' && isDrawerOpen && createPortal(
                    <div className="fixed inset-0 z-[100000] flex justify-end">
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => setIsDrawerOpen(false)} />
                        
                        <div className="relative w-full max-w-md bg-[#050505] h-full shadow-2xl flex flex-col border-l border-white/5 animate-slide-in-right">
                            {/* Drawer Header */}
                            <div className="px-8 py-10 md:px-12 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black">
                                <h2 className="text-3xl font-serif text-brand-gold tracking-wide">Filters</h2>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-4 bg-white/5 rounded-full hover:bg-brand-gold hover:text-black transition-all"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-16 no-scrollbar">
                                {/* Search Facet */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Search size={14} className="text-brand-gold/60" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Search Result</h3>
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="Search in this collection..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-brand-gold/40 focus:bg-white/[0.07] outline-none transition-all placeholder:text-white/10"
                                        />
                                        <Search size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/5 group-focus-within:text-brand-gold transition-colors" />
                                    </div>
                                </div>

                                {/* Brand Facet */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Filter size={14} className="text-brand-gold/60" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Select Brand</h3>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => setSelectedBrand('')}
                                            className={`flex items-center justify-between px-6 py-5 rounded-2xl border transition-all duration-500 ${selectedBrand === ''
                                                ? 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold shadow-[0_15px_40px_rgba(255,215,0,0.1)]'
                                                : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white'}`}
                                        >
                                            <span className="font-bold tracking-widest text-[10px] uppercase">All Products</span>
                                            <span className="text-[10px] opacity-30">/ {subCategoryProducts.length}</span>
                                        </button>
                                        {availableBrands.map(brand => (
                                            <button
                                                key={brand.id}
                                                onClick={() => setSelectedBrand(brand.id)}
                                                className={`flex items-center justify-between px-6 py-5 rounded-2xl border transition-all duration-500 ${selectedBrand === brand.id
                                                    ? 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold shadow-[0_15px_40px_rgba(255,215,0,0.1)]'
                                                    : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white'}`}
                                            >
                                                <span className="font-bold tracking-widest text-[10px] uppercase">{brand.name}</span>
                                                <span className="text-[10px] opacity-30">/ {brandCounts[brand.id]}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-8 md:p-12 border-t border-white/5 bg-black space-y-4">
                                {(selectedBrand || searchQuery) && (
                                    <button
                                        onClick={resetFilters}
                                        className="w-full text-[10px] text-white/30 hover:text-brand-gold uppercase tracking-[0.4em] font-black transition-colors mb-2"
                                    >
                                        Reset All Filters
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="w-full py-6 bg-brand-gold text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    Show {totalProducts} Results
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Product Grid Container */}
                <div className="w-full">
                    {loading ? (
                        <div className="py-32 text-center text-left">
                            <div className="w-12 h-12 border border-white/10 border-t-brand-gold rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-white/30 uppercase tracking-[0.2em] text-xs animate-pulse">Scanning Archive...</p>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-fade-in-up delay-100">
                            {products.map((p, index) => (
                                <ProductCard key={p.id} product={p} priority={index < 5} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-white/40 border border-white/5 rounded-lg bg-white/5 mx-4">
                            <p className="text-lg mb-4 font-serif italic">No products matched your refined selection.</p>
                            <button onClick={resetFilters} className="inline-block mt-4 text-brand-gold text-xs tracking-widest uppercase hover:underline">
                                Clear all filters
                            </button>
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
                                <ChevronLeft size={16} /> Previous Page
                            </button>

                            <div className="hidden md:flex gap-4">
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
                                            <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-[10px] text-white/50">
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(p as number)}
                                                className={`w-10 h-10 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${currentPage === p
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
                                Next Page <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubCategoryPage;