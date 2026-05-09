'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ArrowLeft } from 'lucide-react';
import { fetchProducts, fetchBrands } from '../lib/api';
import { Product } from '../lib/types';
import { ProductCard } from './ProductCard';
import { SmartLink } from './SmartLink';

export default function SearchArea() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    const [searchTerm, setSearchTerm] = useState(query);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const performSearch = React.useCallback(async (q: string) => {
        setLoading(true);
        setSearched(true);
        try {
            // 1. Fetch matching brands (to merge their products into search)
            const allBrands = await fetchBrands();
            const matchingBrands = allBrands.filter(b =>
                b.name.toLowerCase().includes(q.toLowerCase())
            );

            // 2. Standard search results (text match)
            const params = new URLSearchParams();
            params.set('search', q);
            params.set('limit', '100');
            const { products: searchResults } = await fetchProducts(params);

            // 3. Brand-specific results (if brand name matches query)
            let brandProducts: Product[] = [];
            if (matchingBrands.length > 0) {
                 const brandResults = await Promise.all(
                    matchingBrands.map(async (b) => {
                        const bParams = new URLSearchParams();
                        bParams.set('brand_id', b.id.toString());
                        bParams.set('limit', '100');
                        const { products: bProds } = await fetchProducts(bParams);
                        return bProds;
                    })
                );
                brandProducts = brandResults.flat();
            }

            // 4. Merge results and ensure uniqueness
            const uniqueResultsMap = new Map<string, Product>();
            searchResults.forEach(p => uniqueResultsMap.set(p.id.toString(), p));
            brandProducts.forEach(p => uniqueResultsMap.set(p.id.toString(), p));

            setProducts(Array.from(uniqueResultsMap.values()));

        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced URL updates
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            const trimmedTerm = searchTerm.trim();
            if (trimmedTerm) {
                if (searchParams.get('q') !== trimmedTerm) {
                    const newParams = new URLSearchParams(searchParams.toString());
                    newParams.set('q', trimmedTerm);
                    router.replace(`/search?${newParams.toString()}`);
                }
            } else {
                if (searchParams.get('q')) {
                    router.replace('/search');
                }
                setProducts([]);
                setSearched(false);
            }
        }, 500);

        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [searchTerm, searchParams, router]);

    // Initial load from URL
    useEffect(() => {
        if (query) {
            setSearchTerm(query);
            performSearch(query);
        }
    }, [query, performSearch]);

    return (
        <div className="bg-black min-h-screen pt-24 md:pt-36 pb-12 text-white">
            <div className="container mx-auto px-4 md:px-8">
                {/* Search Header */}
                <div className="mb-12 max-w-2xl mx-auto relative">
                    <button
                        onClick={() => router.back()}
                        className="absolute left-0 top-0 md:-left-16 text-white/50 hover:text-white transition-colors p-2"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="text-center">
                        <h1 className="font-serif text-3xl md:text-4xl mb-6">Search</h1>
                        <form onSubmit={(e) => e.preventDefault()} className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for products, brands, or codes..."
                                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-6 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-colors text-lg"
                                autoFocus
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={24} />
                        </form>
                    </div>
                </div>

                {/* Results Section */}
                {loading && (
                    <div className="py-20 text-center text-white/40">
                        <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        Searching...
                    </div>
                )}

                {!loading && searched && products.length === 0 && (
                    <div className="py-20 text-center text-white/40 border border-white/10 rounded-lg bg-white/5">
                        <p className="text-lg mb-2">No results found for &quot;{query}&quot;</p>
                        <p className="text-sm">Try checking your spelling or using different keywords.</p>
                        <SmartLink href="/" className="inline-block mt-6 text-[#d4af37] underline hover:text-white">Return Home</SmartLink>
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <div className="animate-in fade-in duration-500">
                        <p className="text-white/50 mb-6 uppercase tracking-widest text-xs font-bold">
                            {products.length} Result{products.length !== 1 && 's'} Found
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
