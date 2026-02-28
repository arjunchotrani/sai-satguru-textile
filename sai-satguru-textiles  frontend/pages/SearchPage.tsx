
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchProductImages } from '../services/products';
import { fetchBrands } from '../services/brands';
import { Product } from '../types';
import { SEO } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { Search, ArrowLeft } from 'lucide-react';

export const SearchPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';

    const [searchTerm, setSearchTerm] = useState(query);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const fetchedImageIds = useRef<Set<string>>(new Set());
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Initial load from URL
    useEffect(() => {
        if (query !== searchTerm) {
            setSearchTerm(query);
        }
    }, [query]);

    // Debounced search effect
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            const trimmedTerm = searchTerm.trim();
            if (trimmedTerm) {
                // Only update URL if it's different to avoid loops
                if (searchParams.get('q') !== trimmedTerm) {
                    setSearchParams({ q: trimmedTerm }, { replace: true });
                }
                performSearch(trimmedTerm);
            } else {
                setProducts([]);
                setSearched(false);
                if (searchParams.get('q')) {
                    setSearchParams({}, { replace: true });
                }
            }
        }, 500); // 500ms delay

        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [searchTerm]);

    const performSearch = async (q: string) => {
        setLoading(true);
        setSearched(true);
        fetchedImageIds.current.clear();
        try {
            // 1. Fetch matching brands (by name)
            const allBrands = await fetchBrands();
            const matchingBrands = allBrands.filter(b =>
                b.name.toLowerCase().includes(q.toLowerCase())
            );

            // 2. Standard search results (match name/description in backend)
            // Note: Backend might return products with brand name in title even if brandId is missing.
            const searchResults = await fetchProducts({ search: q, limit: 100 });

            // 3. Brand-specific results (Strict filtering)
            let brandProducts: Product[] = [];
            if (matchingBrands.length > 0) {
                // Fetch all/subset products for these brands
                // Since backend brand_id filter is unreliable, we fetch and filter strictly on client.
                const brandResults = await Promise.all(
                    matchingBrands.map(async (b) => {
                        const allProds = await fetchProducts({ limit: 100 });
                        return allProds.filter(p =>
                            (p.brandId && p.brandId.toLowerCase() === b.id.toLowerCase()) ||
                            (p.brandName && p.brandName.toLowerCase() === b.name.toLowerCase())
                        );
                    })
                );
                brandProducts = brandResults.flat();
            }

            // 4. Merge results and ensure uniqueness
            // Deduplicate by ID
            const uniqueResultsMap = new Map<string, Product>();

            // Add search results first (text match priority)
            searchResults.forEach(p => uniqueResultsMap.set(p.id, p));

            // Add brand results (merges or adds)
            brandProducts.forEach(p => uniqueResultsMap.set(p.id, p));

            setProducts(Array.from(uniqueResultsMap.values()));

        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black min-h-screen pt-24 md:pt-36 pb-12 text-white">
            <SEO
                title={`Search Results for "${query}" | Sai Satguru Textile`}
                description="Search our exclusive collection of wholesale textiles."
            />
            <div className="container mx-auto px-4 md:px-8">
                {/* Search Header */}
                <div className="mb-12 max-w-2xl mx-auto relative">
                    <button
                        onClick={() => navigate(-1)}
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
                                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-6 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-gold transition-colors text-lg"
                                autoFocus
                                enterKeyHint="search"
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={24} />
                        </form>
                    </div>
                </div>

                {/* Results */}
                {loading && (
                    <div className="py-20 text-center text-white/40">
                        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        Searching...
                    </div>
                )}

                {!loading && searched && products.length === 0 && (
                    <div className="py-20 text-center text-white/40 border border-white/10 rounded-lg bg-white/5">
                        <p className="text-lg mb-2">No results found for "{query}"</p>
                        <p className="text-sm">Try checking your spelling or using different keywords.</p>
                        <Link to="/" className="inline-block mt-6 text-brand-gold underline hover:text-white">Return Home</Link>
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <div>
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
};

export default SearchPage;
