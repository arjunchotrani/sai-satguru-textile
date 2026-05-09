export const revalidate = 1800;
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, AlignLeft, ChevronLeft } from 'lucide-react';
import { ProductCard } from '../../../components/ProductCard';
import { CategoryUI } from '../../../components/CategoryUI';
import { fetchCategoryBySlug, fetchProducts, fetchBrands, fetchCategories, fetchSubCategories } from '../../../lib/api';
import { Category, SubCategory, Brand } from '../../../lib/types';
import type { Metadata } from 'next';

const PAGE_SIZE = 10;

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ categorySlug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
    const { categorySlug } = await params;
    const sp = await searchParams;
    const category = await fetchCategoryBySlug(categorySlug);
    if (!category) return {};

    const title = category.label || category.name || 'Collection';
    const page = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
    const safePage = isNaN(page) || page < 1 ? 1 : page;

    const pageTitle = safePage > 1 ? `${title} — Page ${safePage}` : title;
    const canonical = safePage > 1
        ? `https://saisatgurutextile.com/category/${categorySlug}?page=${safePage}`
        : `https://saisatgurutextile.com/category/${categorySlug}`;

    return {
        title: pageTitle,
        description: `Browse our premium ${title} collection. Wholesale prices on luxury textiles from Surat.`,
        alternates: {
            canonical,
        },
    };
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ categorySlug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { categorySlug } = await params;
    const sp = await searchParams;
    
    // Parallel fetch Category and initial data
    const [category, allBrands, allSubCats, allCats] = await Promise.all([
        fetchCategoryBySlug(categorySlug),
        fetchBrands(),
        fetchSubCategories(),
        fetchCategories()
    ]);
    
    if (!category) {
        notFound();
    }

    const title = category.label || category.name || 'Collection';

    // Helper to format category names naturally
    const formatName = (str: string) => {
        if (!str) return '';
        // Convert to Title Case and remove any strange concatenations if they exist
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const naturalName = formatName(title);
    const lowerName = naturalName.toLowerCase();

    // Filter relevant sub-categories for this category
    const categorySubCats = allSubCats
        .filter((s: SubCategory) => (s.categoryId === category.id || s.category_id === category.id))
        .sort((a: SubCategory, b: SubCategory) => (a.display_order ?? 0) - (b.display_order ?? 0));

    // Filter other categories for "Related" section
    const otherCategories = allCats
        .filter((c: Category) => c.id !== category.id && (c.is_active === 1 || c.is_active === true))
        .slice(0, 4);

    // Internal Links Logic: if < 3 subcategories, mix with related categories
    const displayLinks = categorySubCats.length >= 3 
        ? categorySubCats.map(s => ({ type: 'subcategory', data: s }))
        : [
            ...categorySubCats.map(s => ({ type: 'subcategory', data: s })),
            ...otherCategories.slice(0, 4 - categorySubCats.length).map(c => ({ type: 'category', data: c }))
        ];

    // Parse URL Params purely for Server side fetches
    const currentPage = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
    const safePage = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
    const sortBy = typeof sp.sort === 'string' ? sp.sort : 'latest';
    const searchQuery = typeof sp.search === 'string' ? sp.search : undefined;
    const brandId = typeof sp.brand === 'string' ? sp.brand : undefined;

    // Fetch Rendered Products
    const productsStart = Date.now();
    const { products, total } = await fetchProducts(new URLSearchParams({
        category_id: category.id,
        limit: PAGE_SIZE.toString(),
        page: safePage.toString(),
        sort: sortBy,
        ...(searchQuery ? { search: searchQuery } : {}),
        ...(brandId ? { brand_id: brandId } : {}),
    }));

    const totalPages = Math.ceil(total / PAGE_SIZE);

    // Provide all brands to the filter without expensive pre-computation
    const availableBrands = allBrands.sort((a: Brand, b: Brand) => a.name.localeCompare(b.name));
    const brandCounts: Record<string, number> = {}; // Omitted for performance

    // Helper to generate pagination URLs
    const getPageUrl = (pageNumber: number) => {
        const urlParams = new URLSearchParams();
        if (sortBy !== 'latest') urlParams.set('sort', sortBy);
        if (searchQuery) urlParams.set('search', searchQuery);
        if (brandId) urlParams.set('brand', brandId);
        if (pageNumber > 1) urlParams.set('page', pageNumber.toString());
        const qs = urlParams.toString();
        return `/category/${categorySlug}${qs ? `?${qs}` : ''}`;
    };

    return (
        <div className="bg-black min-h-screen pt-32 pb-24 text-white animate-reveal">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://saisatgurutextile.com' },
                        { '@type': 'ListItem', position: 2, name: title, item: `https://saisatgurutextile.com/category/${categorySlug}` },
                    ],
                }) }}
            />
            <div className="container mx-auto px-6 md:px-12 text-left">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/50 uppercase tracking-widest mb-8 md:mb-12 animate-fade-in">
                    <Link href="/" className="hover:text-[#d4af37] transition-colors">Home</Link>
                    <ChevronRight size={10} />
                    <span className="text-[#d4af37] font-bold">{title}</span>
                </div>

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 border-b border-white/10 pb-8 animate-fade-in-up">
                    <div className="max-w-2xl text-left">
                        <span className="text-[#d4af37] text-xs font-bold tracking-[0.3em] uppercase mb-4 block flex items-center gap-2">
                            <AlignLeft size={14} /> Premium Collection
                        </span>
                        <h1 className="font-serif text-3xl md:text-6xl text-white mb-2 md:mb-4 uppercase">
                            {title}
                        </h1>
                        <p className="text-white/60 text-xs md:text-base font-light tracking-wide leading-relaxed">
                            {total} Items Available in this selection
                        </p>
                    </div>

                    <CategoryUI 
                        categoryProductsCount={total}
                        availableBrands={availableBrands}
                        brandCounts={brandCounts}
                    />
                </div>

                {/* Product Grid Container */}
                <div className="w-full">
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-fade-in-up">
                            {products.map((p, index) => (
                                <ProductCard key={p.id} product={p} priority={index < 5 && safePage === 1} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-white/40 border border-white/5 rounded-lg bg-white/5 mx-4">
                            <p className="text-lg mb-4 font-serif italic">No products matched your refined selection.</p>
                            <Link href={`/category/${categorySlug}`} className="inline-block mt-4 text-[#d4af37] text-xs tracking-widest uppercase hover:underline">
                                Clear all filters
                            </Link>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-10 py-8 border-t border-white/5">
                            <Link
                                href={safePage > 1 ? getPageUrl(safePage - 1) : '#'}
                                className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-[#d4af37] transition-colors ${safePage === 1 ? 'opacity-20 pointer-events-none' : ''}`}
                            >
                                <ChevronLeft size={16} /> Previous
                            </Link>

                            <div className="flex gap-4">
                                {(() => {
                                    const pages = [];
                                    for (let i = 1; i <= totalPages; i++) {
                                        if (i === 1 || i === totalPages || (i >= safePage - 1 && i <= safePage + 1)) {
                                            pages.push(i);
                                        } else if (pages[pages.length - 1] !== '...') {
                                            pages.push('...');
                                        }
                                    }
                                    return pages.map((p, i) => (
                                        p === '...' ? (
                                            <span key={i} className="text-white/20 px-2">...</span>
                                        ) : (
                                            <Link
                                                key={i}
                                                href={getPageUrl(p as number)}
                                                className={`w-10 h-10 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${safePage === p
                                                    ? "border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10"
                                                    : "border-white/10 text-white/30 hover:border-white/30"
                                                    }`}
                                            >
                                                {p}
                                            </Link>
                                        )
                                    ));
                                })()}
                            </div>

                            <Link
                                href={safePage < totalPages ? getPageUrl(safePage + 1) : '#'}
                                className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-[#d4af37] transition-colors ${safePage === totalPages ? 'opacity-20 pointer-events-none' : ''}`}
                            >
                                Next Page <ChevronRight size={16} />
                            </Link>
                        </div>
                    )}

                    {/* SEO CONTENT SECTION */}
                    <section className="mt-12 md:mt-16 pt-12 border-t border-white/5">
                        <div className="max-w-4xl mx-auto">
                            <span className="text-[#d4af37] text-[10px] uppercase tracking-[0.4em] font-bold mb-4 block">
                                Premium Wholesale Sourcing
                            </span>
                            <h2 className="font-serif text-2xl md:text-4xl text-white mb-8 leading-tight">
                                Wholesale {naturalName} Collections from Surat
                            </h2>
                            <div className="text-white/45 text-sm md:text-base font-light leading-relaxed space-y-6 text-justify">
                                <p>
                                    Explore premium {lowerName} collections sourced directly from India&apos;s textile capital, Surat. 
                                    Sai Satguru Textile offers a curated selection of high-quality {lowerName} styles, 
                                    designed to meet the demands of modern ethnic wear markets. Our wholesale catalog features 
                                    trending designs and premium fabrics, ensuring your boutique or retail store stays ahead 
                                    of the latest fashion curves.
                                </p>
                                <p>
                                    Browse our fresh {lowerName} arrivals tailored for retailers, resellers, and boutique owners 
                                    seeking luxury textiles at competitive wholesale prices. We prioritize quality and 
                                    craftsmanship in every piece, from intricate embroideries to elegant prints, making us 
                                    a trusted partner for your textile sourcing needs.
                                </p>
                                <p className="text-[#d4af37] font-medium italic">
                                    For bulk enquiries and catalogue requests, contact our dedicated support team on WhatsApp 
                                    for real-time pricing and availability on our latest {lowerName} range.
                                </p>
                            </div>
                        </div>

                        {/* Internal Links Section */}
                        <div className="mt-20 md:mt-24 max-w-5xl mx-auto">
                            <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-center md:text-left">
                                Explore More Styles
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {displayLinks.map((link, idx) => {
                                    const isSub = link.type === 'subcategory';
                                    const item = link.data as any;
                                    const href = isSub 
                                        ? `/category/${categorySlug}/${item.slug}`
                                        : `/category/${item.slug}`;
                                    
                                    return (
                                        <Link
                                            key={idx}
                                            href={href}
                                            className="group p-6 border border-white/5 bg-white/[0.02] hover:border-[#d4af37]/30 transition-all text-center"
                                        >
                                            <span className="text-xs font-bold text-white/50 group-hover:text-[#d4af37] transition-colors uppercase tracking-widest block mb-1">
                                                {item.label || item.name}
                                            </span>
                                            <span className="text-[10px] text-white/20 uppercase tracking-tighter italic">
                                                {isSub ? naturalName : 'Collection'}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
