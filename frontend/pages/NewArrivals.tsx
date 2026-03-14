import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { fetchNewArrivals, fetchProductImages } from "../services/products";
import type { Product } from "../types";

const PAGE_SIZE = 12;

export const NewArrivals: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const fetchedImageIds = React.useRef<Set<string>>(new Set());

  // 🔹 Fetch products from backend (pagination handled by API)
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetchNewArrivals(currentPage, PAGE_SIZE);
        setProducts(res.products);
        setTotalPages(Math.ceil(res.total / PAGE_SIZE));
      } catch (error) {
        console.error("Failed to load new arrivals", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [currentPage]);

  // 🔹 Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <div className="bg-black min-h-screen pt-24 pb-12 text-white">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wider mb-8">
          <Link to="/" className="hover:text-brand-gold">Home</Link>
          <span>/</span>
          <span className="text-white font-bold">New Arrivals</span>
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">
            New Arrivals
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Discover our newest textiles and fashion arrivals across all categories, updated daily with the latest trends.
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-20 flex items-center justify-center gap-6">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-brand-gold disabled:opacity-20 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <div className="flex gap-4">
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
                        <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-[10px] text-white/50">
                          ...
                        </span>
                      ) : (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(p as number)}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${currentPage === p
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
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(totalPages, prev + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-brand-gold disabled:opacity-20 disabled:pointer-events-none transition-colors"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center text-white/40 border border-white/10 rounded-lg bg-white/5">
            <p className="text-lg">
              {loading ? "Loading new arrivals..." : "No fresh arrivals at this moment."}
            </p>
            <Link
              to="/"
              className="inline-block mt-6 text-brand-gold underline hover:text-white transition-colors"
            >
              Browse Collections
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
