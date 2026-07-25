'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ArrowLeft, RefreshCw } from 'lucide-react';
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
    const [hasError, setHasError] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const performSearch = useCallback(async (q: string) => {
        // Cancel any in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setSearched(true);
        setHasError(false);

        try {
            const [allBrands, { products: searchResults }] = await Promise.all([
                fetchBrands(),
                fetchProducts(new URLSearchParams({ search: q, limit: '100' })),
            ]);

            const matchingBrands = allBrands.filter(b =>
                b.name.toLowerCase().includes(q.toLowerCase())
            );

            let brandProducts: Product[] = [];
            if (matchingBrands.length > 0) {
                const brandResults = await Promise.all(
                    matchingBrands.map(async (b) => {
                        const bParams = new URLSearchParams({ brand_id: b.id.toString(), limit: '100' });
                        const { products: bProds } = await fetchProducts(bParams);
                        return bProds;
                    })
                );
                brandProducts = brandResults.flat();
            }

            const uniqueResultsMap = new Map<string, Product>();
            searchResults.forEach(p => uniqueResultsMap.set(p.id.toString(), p));
            brandProducts.forEach(p => uniqueResultsMap.set(p.id.toString(), p));

            setProducts(Array.from(uniqueResultsMap.values()));
        } catch (error: any) {
            if (error?.name === 'AbortError') return;
            console.error('Search failed:', error);
            setHasError(true);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced URL updates on typing
    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            const trimmed = searchTerm.trim();
            if (trimmed) {
                if (searchParams.get('q') !== trimmed) {
                    const newParams = new URLSearchParams(searchParams.toString());
                    newParams.set('q', trimmed);
                    router.replace(`/search?${newParams.toString()}`);
                }
            } else {
                if (searchParams.get('q')) router.replace('/search');
                setProducts([]);
                setSearched(false);
                setHasError(false);
            }
        }, 500);

        return () => { if (debounceTimeout.current) clearTimeout(debounceTimeout.current); };
    }, [searchTerm, searchParams, router]);

    // Run search when URL query param changes
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

                {/* Loading */}
                {loading && (
                    <div className="py-20 text-center text-white/40">
                        <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        Searching...
                    </div>
                )}

                {/* Error state */}
                {!loading && hasError && (
                    <div className="py-20 text-center text-white/40 border border-white/10 rounded-lg bg-white/5">
                        <p className="text-lg mb-2">Search failed — please try again</p>
                        <p className="text-sm mb-6">The server may be waking up. This usually resolves in seconds.</p>
                        <button
                            onClick={() => performSearch(query)}
                            className="inline-flex items-center gap-2 bg-[#d4af37] text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm"
                        >
                            <RefreshCw size={14} /> Try Again
                        </button>
                    </div>
                )}

                {/* No results */}
                {!loading && !hasError && searched && products.length === 0 && (
                    <div className="py-20 text-center text-white/40 border border-white/10 rounded-lg bg-white/5">
                        <p className="text-lg mb-2">No results found for &quot;{query}&quot;</p>
                        <p className="text-sm">Try checking your spelling or using different keywords.</p>
                        <SmartLink href="/" className="inline-block mt-6 text-[#d4af37] underline hover:text-white">Return Home</SmartLink>
                    </div>
                )}

                {/* Results */}
                {!loading && !hasError && products.length > 0 && (
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
