
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchBrands } from '../services/brands';
import { Brand } from '../types';
import { SEO } from '../components/SEO';
import { Search } from 'lucide-react';

export const BrandsPage: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadBrands = async () => {
            try {
                const data = await fetchBrands();
                // Filter active brands if needed, though service returns data directly
                setBrands(data.filter(b => b.is_active !== false));
            } catch (error) {
                console.error("Failed to load brands", error);
            } finally {
                setLoading(false);
            }
        };
        loadBrands();
    }, []);

    const filteredBrands = useMemo(() => {
        if (!searchQuery) return brands;
        const lowerQ = searchQuery.toLowerCase();
        return brands.filter(b => b.name.toLowerCase().includes(lowerQ));
    }, [brands, searchQuery]);

    // Group by first letter
    const groupedBrands = useMemo(() => {
        const groups: Record<string, Brand[]> = {};
        filteredBrands.forEach(brand => {
            const letter = brand.name.charAt(0).toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(brand);
        });
        return Object.keys(groups).sort().reduce((acc, key) => {
            acc[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
            return acc;
        }, {} as Record<string, Brand[]>);
    }, [filteredBrands]);

    return (
        <div className="bg-black min-h-screen pt-32 pb-24 text-white">
            <SEO
                title="Our Brands | Sai Satguru Textile"
                description="Explore our curated collection of premium textile brands."
            />

            <div className="container mx-auto px-6 md:px-12">
                {/* Hero Section */}
                <div className="text-center mb-20 max-w-4xl mx-auto">
                    <span className="text-brand-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block animate-fade-in">
                        Excellence in Textiles
                    </span>
                    <h1 className="sr-only">Wholesale Textile Brands in Surat</h1>
                    <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-8 animate-fade-in-up">
                        Our Brands
                    </h2>
                    <div className="h-px w-24 bg-brand-gold mx-auto mb-8 opacity-50"></div>
                    <p className="text-white/60 text-lg font-light tracking-wide max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">
                        Discover a curated selection of India's finest textile manufacturers, chosen for their quality, heritage, and innovation.
                    </p>

                    {/* Search Bar - Minimal & Centered */}
                    <div className="mt-12 relative max-w-md mx-auto group animate-fade-in-up delay-200">
                        <input
                            type="text"
                            placeholder="Search brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 py-4 pl-12 pr-4 text-lg font-serif text-white placeholder:text-white/30 focus:outline-none focus:border-brand-gold transition-all text-center focus:text-left focus:placeholder-shown:text-center"
                        />
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-gold transition-colors duration-300 pointer-events-none" size={20} strokeWidth={1.5} />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="py-32 text-center">
                        <div className="w-12 h-12 border border-white/10 border-t-brand-gold rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white/30 uppercase tracking-[0.2em] text-xs animate-pulse">Curating Collection...</p>
                    </div>
                ) : filteredBrands.length === 0 ? (
                    <div className="py-24 text-center text-white/30 animate-fade-in">
                        <p className="text-xl font-serif italic">No brands found matching "{searchQuery}".</p>
                    </div>
                ) : (
                    <div className="space-y-16 animate-fade-in delay-300">
                        {Object.entries(groupedBrands).map(([letter, brandList]) => (
                            <div key={letter} className="relative group/letter">
                                {/* Letter Header - Stylish Watermark */}
                                <div className="absolute -top-8 -left-4 md:-left-12 opacity-5 select-none text-[6rem] md:text-[10rem] font-serif font-bold text-white leading-none pointer-events-none group-hover/letter:opacity-10 transition-opacity duration-700">
                                    {letter}
                                </div>

                                <div className="flex items-center gap-6 mb-8 relative z-10 pl-4 md:pl-0">
                                    <span className="text-brand-gold font-serif text-2xl md:text-3xl">{letter}</span>
                                    <div className="h-px bg-white/10 flex-grow"></div>
                                </div>

                                {/* Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 relative z-10">
                                    {(brandList as Brand[]).map((brand) => (
                                        <Link
                                            key={brand.id}
                                            to={`/brand/${brand.slug}`}
                                            className="group relative p-6 md:p-8 bg-white/5 border border-white/5 hover:border-brand-gold/30 transition-all duration-500 hover:bg-white/10 overflow-hidden flex flex-col items-center justify-center text-center aspect-[5/3] md:aspect-[4/3]"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/0 via-transparent to-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            {/* Top Border Accent */}
                                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                                            <div className="relative z-10 space-y-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                                                <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-white/80 group-hover:text-brand-gold transition-colors duration-300">
                                                    {brand.name}
                                                </h3>
                                            </div>

                                            {/* Hover CTA */}
                                            <div className="absolute bottom-6 left-0 right-0 text-center opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-medium">View Collection</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandsPage;
