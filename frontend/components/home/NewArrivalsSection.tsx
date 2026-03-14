import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../ProductCard';
import { CommunityCTA } from './CommunityCTA';
import { Product } from '../../types';

interface NewArrivalsSectionProps {
    products: Product[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    arrivalsRef: React.RefObject<HTMLElement>;
}

const PAGE_SIZE = 12;

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
    products,
    isLoading,
    currentPage,
    totalPages,
    handlePageChange,
    arrivalsRef
}) => {
    return (
        <section
            ref={arrivalsRef}
            id="new-arrivals"
            className="py-12 md:py-24 px-4 md:px-12 bg-neutral-950"
        >
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 md:mb-16 reveal">
                    <h2 className="text-3xl md:text-6xl font-serif mb-2 md:mb-4">
                        New Arrivals
                    </h2>
                    <p className="text-white/40 italic text-sm md:text-base">
                        Our latest designs, automatically updated across all categories.
                    </p>
                </div>

                {isLoading && products.length === 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                        {[...Array(PAGE_SIZE)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[3/4] bg-white/5 mb-4" />
                                <div className="h-4 bg-white/5 w-2/3 mb-2" />
                                <div className="h-4 bg-white/5 w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                            {products.map((product, idx) => (
                                <div key={product.id} className="reveal fade-in-up">
                                    <ProductCard
                                        product={product}
                                        priority={currentPage === 1 && idx < 4}
                                    />
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 md:mt-20 flex justify-center gap-4 md:gap-6 reveal">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    aria-label="Previous Page"
                                    className="p-2 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-2">
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
                                                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-white/50">
                                                    ...
                                                </span>
                                            ) : (
                                                <button
                                                    key={i}
                                                    onClick={() => handlePageChange(p as number)}
                                                    className={`w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors ${currentPage === p
                                                        ? "bg-brand-gold text-black"
                                                        : "text-white/50 hover:text-white"
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            )
                                        ));
                                    })()}
                                </div>

                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    aria-label="Next Page"
                                    className="p-2 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 text-white/30 border border-white/5 bg-white/[0.02]">
                        No products found in our catalog yet.
                    </div>
                )}

                <CommunityCTA />
            </div>
        </section>
    );
};
