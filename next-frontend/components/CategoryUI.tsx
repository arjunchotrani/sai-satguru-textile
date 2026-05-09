'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, ChevronDown, X, Search } from 'lucide-react';
import type { Brand } from '../lib/types';

interface CategoryUIProps {
    categoryProductsCount: number;
    availableBrands: Brand[];
    brandCounts: Record<string, number>;
}

export const CategoryUI: React.FC<CategoryUIProps> = ({ 
    categoryProductsCount, 
    availableBrands, 
    brandCounts 
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // Derived state from URL perfectly syncs with Server Component
    const selectedBrand = searchParams.get('brand') || '';
    const searchQuery = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort') || 'latest';

    // Temporary states for the drawer
    const [tempSearchQuery, setTempSearchQuery] = useState(searchQuery);
    const [tempSelectedBrand, setTempSelectedBrand] = useState(selectedBrand);

    useEffect(() => {
        // Defer to avoid synchronous setState warning during render cycle
        const t = setTimeout(() => {
            setTempSearchQuery(searchQuery);
            setTempSelectedBrand(selectedBrand);
        }, 0);
        return () => clearTimeout(t);
    }, [searchQuery, selectedBrand, isDrawerOpen]);

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page'); // Reset page when filter changes
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const applyDrawerFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (tempSearchQuery) params.set('search', tempSearchQuery);
        else params.delete('search');
        
        if (tempSelectedBrand) params.set('brand', tempSelectedBrand);
        else params.delete('brand');

        params.delete('page');
        router.push(`?${params.toString()}`, { scroll: false });
        setIsDrawerOpen(false);
    };

    const resetFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('search');
        params.delete('brand');
        params.delete('page');
        router.push(`?${params.toString()}`, { scroll: false });
        setIsDrawerOpen(false);
    };

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto mt-6 md:mt-0">
            {/* Sort Dropdown */}
            <div className="relative w-full md:w-auto">
                <select
                    value={sortBy}
                    onChange={(e) => updateFilters('sort', e.target.value)}
                    className="w-full appearance-none bg-white/5 text-white border border-white/10 px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:border-[#d4af37]/50 transition-all cursor-pointer pr-12"
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
                className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-3 rounded-full bg-[#d4af37] text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#d4af37]/20"
            >
                <Filter size={16} />
                Filters
                {(selectedBrand || searchQuery) && (
                    <span className="bg-black text-[#d4af37] w-5 h-5 rounded-full flex items-center justify-center text-[8px] border border-black/10">!</span>
                )}
            </button>

            {/* Sidebar Filter Drawer */}
            {typeof document !== 'undefined' && isDrawerOpen && createPortal(
                <div className="fixed inset-0 z-[100000] flex justify-end">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => setIsDrawerOpen(false)} />
                    
                    <div className="relative w-full max-w-md bg-[#050505] h-full shadow-2xl flex flex-col border-l border-white/5 animate-slide-in-right">
                        {/* Drawer Header */}
                        <div className="px-8 py-10 md:px-12 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black">
                            <h2 className="text-3xl font-serif text-[#d4af37] tracking-wide">Filters</h2>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-4 bg-white/5 rounded-full hover:bg-[#d4af37] hover:text-black transition-all"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-16 no-scrollbar">
                            {/* Search Facet */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Search size={14} className="text-[#d4af37]/60" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Search Result</h3>
                                </div>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Search in this collection..."
                                        value={tempSearchQuery}
                                        onChange={(e) => setTempSearchQuery(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-[#d4af37]/40 focus:bg-white/[0.07] outline-none transition-all placeholder:text-white/10 text-white"
                                    />
                                    <Search size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/5 group-focus-within:text-[#d4af37] transition-colors" />
                                </div>
                            </div>

                            {/* Brand Facet */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Filter size={14} className="text-[#d4af37]/60" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Select Brand</h3>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => setTempSelectedBrand('')}
                                        className={`flex items-center justify-between px-6 py-5 rounded-2xl border transition-all duration-500 ${tempSelectedBrand === ''
                                            ? 'bg-[#d4af37]/10 border-[#d4af37]/40 text-[#d4af37] shadow-[0_15px_40px_rgba(255,215,0,0.1)]'
                                            : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white'}`}
                                    >
                                        <span className="font-bold tracking-widest text-[10px] uppercase">All Products</span>
                                        <span className="text-[10px] opacity-30">/ {categoryProductsCount}</span>
                                    </button>
                                    {availableBrands.map(brand => (
                                        <button
                                            key={brand.id}
                                            onClick={() => setTempSelectedBrand(brand.id)}
                                            className={`flex items-center justify-between px-6 py-5 rounded-2xl border transition-all duration-500 ${tempSelectedBrand === brand.id
                                                ? 'bg-[#d4af37]/10 border-[#d4af37]/40 text-[#d4af37] shadow-[0_15px_40px_rgba(255,215,0,0.1)]'
                                                : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white'}`}
                                        >
                                            <span className="font-bold tracking-widest text-[10px] uppercase">{brand.name}</span>
                                            {brandCounts[brand.id] !== undefined && (
                                                <span className="text-[10px] opacity-30">/ {brandCounts[brand.id]}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 md:p-12 border-t border-white/5 bg-black space-y-4">
                            {(tempSelectedBrand || tempSearchQuery) && (
                                <button
                                    onClick={resetFilters}
                                    className="w-full text-[10px] text-white/30 hover:text-[#d4af37] uppercase tracking-[0.4em] font-black transition-colors mb-2"
                                >
                                    Reset All Filters
                                </button>
                            )}
                            <button
                                onClick={applyDrawerFilters}
                                className="w-full py-6 bg-[#d4af37] text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
