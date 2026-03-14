
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { fetchBrandBySlug } from '../services/brands';
import { fetchProducts, fetchProductImages } from '../services/products';
import { Brand, Product, Category } from '../types';
import { fetchCategories } from '../services/categories';
import { SEO } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { Filter, X, ChevronDown, Search } from 'lucide-react';

export const BrandLandingPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [brand, setBrand] = useState<Brand | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchedImageIds = useRef<Set<string>>(new Set());
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Filter states
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState("latest");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const loadData = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                // 1. Fetch Brand Details
                const brandData = await fetchBrandBySlug(slug);
                if (!brandData) {
                    setLoading(false);
                    return; // Handle 404 ideally
                }
                setBrand(brandData);

                // 2. Fetch All Products for this Brand
                const allBrandProducts = await fetchProducts({ brand_id: brandData.id, limit: 100 });

                // Client-side filtering fallback (in case API filter is ignored or returns inconsistent IDs)
                const brandProducts = allBrandProducts.filter(p =>
                    p.brandId === brandData.id ||
                    (p.brandName && p.brandName.toLowerCase() === brandData.name.toLowerCase())
                );

                setProducts(brandProducts);

                // 3. Extract Categories for Filter
                // We need to fetch all categories to map IDs to Names
                const allCats = await fetchCategories();

                // Find which categories are present in the products
                const presentCategoryIds = new Set(brandProducts.map(p => p.categoryId));
                const availableCategories = allCats.filter(c => presentCategoryIds.has(c.id));
                setCategories(availableCategories);

            } catch (error) {
                console.error("Error loading brand page:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [slug]);

    // 🔹 Logic: Memoized Filtered Products (Search + Category)
    const allFilteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
            const matchesSearch = !searchQuery ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    // 🔹 Logic: Memoized Category Counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        products.forEach(p => {
            counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
        });
        return counts;
    }, [products]);

    // Pagination Logic
    const totalPages = Math.ceil(allFilteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = allFilteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const activeFiltersCount = (selectedCategory ? 1 : 0) + (searchQuery ? 1 : 0);

    // Handle Category Change
    const handleCategoryChange = (catId: string) => {
        setSelectedCategory(catId);
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSelectedCategory('');
        setSearchQuery('');
        setSortBy('latest');
        setCurrentPage(1);
    };

    // 🔹 Logic: Scroll active tab into view
    useEffect(() => {
        if (!scrollContainerRef.current) return;
        const activeTab = scrollContainerRef.current.querySelector('[data-active="true"]');
        if (activeTab) {
            activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [selectedCategory]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = 300;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    if (loading) {
        return (
            <div className="bg-black min-h-screen py-20 text-center text-white/40 pt-36">
                <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                Loading brand...
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="bg-black min-h-screen py-20 text-center text-white/40 pt-36">
                <p>Brand not found.</p>
                <Link to="/brands" className="text-brand-gold underline mt-4 inline-block">View all brands</Link>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen pt-24 md:pt-36 pb-12 text-white">
            <SEO
                title={`${brand.name} | Sai Satguru Textile`}
                description={`Shop latest collection from ${brand.name}. Wholesale prices on high quality textiles.`}
            />

            <div className="container mx-auto px-4 md:px-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/50 uppercase tracking-wider mb-4 md:mb-8">
                    <Link to="/" className="hover:text-brand-gold transition-colors">Home</Link>
                    <span className="text-white/20">/</span>
                    <Link to="/brands" className="hover:text-brand-gold transition-colors">Brands</Link>
                    <span className="text-white/20">/</span>
                    <span className="text-brand-gold font-bold">{brand.name}</span>
                </div>

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 border-b border-white/10 pb-8 animate-fade-in-up">
                    <div className="max-w-2xl text-left">
                        <span className="text-brand-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block">
                            Brand Collection
                        </span>
                        <h1 className="font-serif text-3xl md:text-6xl text-white mb-2 md:mb-4">
                            {brand.name}
                        </h1>
                        <p className="text-white/60 text-xs md:text-base font-light tracking-wide leading-relaxed">
                            {allFilteredProducts.length} Premium Product{allFilteredProducts.length !== 1 && 's'} Available
                        </p>
                    </div>

                    {/* Sorting & Filter Actions */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto mt-6 md:mt-0">
                        {/* Sort Dropdown */}
                        <div className="relative w-full md:w-auto flex-1 md:flex-none">
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none bg-white/5 text-white border border-white/10 px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold focus:outline-none focus:border-brand-gold/50 transition-all cursor-pointer pr-10"
                            >
                                <option value="latest" className="bg-[#111]">Latest</option>
                                <option value="price_asc" className="bg-[#111]">Price: Low to High</option>
                                <option value="price_desc" className="bg-[#111]">Price: High to Low</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className={`group flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 relative z-40 ${isDrawerOpen
                                ? 'bg-brand-gold text-black border-brand-gold'
                                : 'bg-white/5 text-white border-white/10 hover:border-brand-gold/50'
                                }`}
                        >
                            <Filter size={16} />
                            <span className="text-xs uppercase tracking-widest font-bold">Filters</span>
                            {activeFiltersCount > 0 && (
                                <span className="ml-1 w-5 h-5 bg-brand-gold text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                                    {activeFiltersCount}
                                </span>
                            )}
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isDrawerOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* 🔹 Sidebar Filter Drawer Overlay (Portaled to Body) */}
                {typeof document !== 'undefined' && createPortal(
                    <div
                        className={`fixed inset-0 transition-opacity duration-500 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        style={{ zIndex: 100000 }}
                    >
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsDrawerOpen(false)}></div>

                        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#050505] shadow-2xl transition-transform duration-500 ease-out border-l border-white/5 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className="flex flex-col h-full">
                                {/* Drawer Header - High Contrast Shield */}
                                <div className="px-6 py-12 md:px-12 border-b border-white/10 flex items-center justify-between bg-black sticky top-0 z-[110] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-3xl font-serif tracking-wide text-brand-gold">Filters</h2>
                                        {activeFiltersCount > 0 && (
                                            <div className="inline-flex">
                                                <div className="bg-brand-gold/10 text-brand-gold text-[8px] font-black px-2 py-0.5 rounded border border-brand-gold/20 uppercase tracking-[0.2em]">
                                                    {activeFiltersCount} Selection{activeFiltersCount !== 1 && 's'} Active
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setIsDrawerOpen(false)}
                                        className="group p-5 bg-white/5 hover:bg-brand-gold rounded-full transition-all text-white/50 hover:text-black shadow-2xl border border-white/5"
                                        aria-label="Close filters"
                                    >
                                        <X size={22} className="group-hover:scale-110 transition-transform duration-300" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-20 custom-scrollbar">
                                    {/* Search Facet */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Search size={16} className="text-brand-gold/60" />
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Search</h3>
                                            </div>
                                            {searchQuery && (
                                                <button onClick={() => setSearchQuery('')} className="text-[9px] text-brand-gold hover:text-white uppercase font-black tracking-widest transition-colors">Clear Search</button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="Search collections..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-brand-gold/40 focus:bg-white/[0.07] outline-none transition-all"
                                            />
                                            <Search size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/5 group-focus-within:text-brand-gold transition-colors" />
                                        </div>
                                    </div>

                                    {/* Category Facet */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Filter size={16} className="text-brand-gold/60" />
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Collections</h3>
                                            </div>
                                            {selectedCategory && (
                                                <button onClick={() => setSelectedCategory('')} className="text-[9px] text-brand-gold hover:text-white uppercase font-black tracking-widest transition-colors">Reset Category</button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <button
                                                onClick={() => handleCategoryChange('')}
                                                className={`flex items-center justify-between px-6 py-6 rounded-2xl border transition-all duration-500 ${selectedCategory === ''
                                                    ? 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold shadow-[0_15px_40px_rgba(255,215,0,0.15)]'
                                                    : 'bg-white/[0.03] border-white/5 text-white/40 hover:border-white/20 hover:text-white'}`}
                                            >
                                                <span className="font-bold tracking-wider text-sm uppercase">All Products</span>
                                                <span className="text-[10px] font-mono font-black bg-white/5 px-2 py-1 rounded">/ {products.length}</span>
                                            </button>
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => handleCategoryChange(cat.id)}
                                                    className={`flex items-center justify-between px-6 py-6 rounded-2xl border transition-all duration-500 ${selectedCategory === cat.id
                                                        ? 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold shadow-[0_15px_40px_rgba(255,215,0,0.15)]'
                                                        : 'bg-white/[0.03] border-white/5 text-white/40 hover:border-white/20 hover:text-white'}`}
                                                >
                                                    <span className="font-bold tracking-wider text-sm uppercase">{cat.label || cat.name}</span>
                                                    <span className="text-[10px] font-mono font-black bg-white/5 px-2 py-1 rounded">/ {categoryCounts[cat.id] || 0}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions - with Clear All */}
                                <div className="p-8 md:p-12 pb-16 md:pb-20 bg-black border-t border-white/10 space-y-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                                    {activeFiltersCount > 0 && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="w-full text-[10px] text-white/30 hover:text-brand-gold uppercase tracking-[0.4em] font-black transition-colors"
                                        >
                                            Reset All Filters
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsDrawerOpen(false)}
                                        className="w-full py-6 bg-brand-gold text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] hover:translate-y-[-2px] hover:shadow-[0_20px_60px_rgba(255,215,0,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <span>Show {allFilteredProducts.length} Results</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 mt-12">
                    {paginatedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-16 mb-8 flex items-center justify-center gap-2">
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
                                    <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-white/50">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setCurrentPage(p as number);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 border flex items-center justify-center ${currentPage === p
                                            ? 'bg-brand-gold border-brand-gold text-black shadow-lg shadow-brand-gold/30'
                                            : 'bg-white/5 border-white/10 text-white/40 hover:border-brand-gold/50 hover:text-white'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                )
                            ));
                        })()}
                    </div>
                )}

                {allFilteredProducts.length === 0 && (
                    <div className="py-32 text-center border-t border-white/10 mt-12 group">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold/40 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                            <Filter size={32} className="opacity-40" />
                        </div>
                        <h3 className="font-serif text-2xl mb-3 text-white/80">Filtered collection is empty</h3>
                        <p className="text-white/40 mb-8 max-w-sm mx-auto leading-relaxed">We couldn't find any products in this category. Try adjusting your filters or explored our full collection.</p>
                        <button
                            onClick={() => clearAllFilters()}
                            className="inline-flex items-center gap-3 px-8 py-3.5 bg-brand-gold text-black rounded-full font-bold text-sm hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(255,215,0,0.3)] transition-all active:scale-95"
                        >
                            <X size={18} /> Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandLandingPage;
