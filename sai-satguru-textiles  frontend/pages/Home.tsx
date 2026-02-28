import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { CONTACT_INFO } from "../constants";
import { SEO } from "../components/SEO";
import { useNewArrivals } from "../hooks/useProducts";

const PAGE_SIZE = 12;

const CommunityCTA = () => (
  <div className="mt-20 reveal bg-gradient-to-r from-brand-dark to-neutral-900 border border-white/5 p-8 md:p-12 text-center rounded-sm">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-full mb-6 border border-[#25D366]/20">
      <MessageCircle size={32} />
    </div>
    <h3 className="font-serif text-2xl md:text-3xl mb-4">
      Join Our WhatsApp Community Group
    </h3>
    <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto mb-8 font-light">
      Get instant updates on the latest textile arrivals and catalogs.
    </p>
    <a
      href={CONTACT_INFO.whatsappCommunity}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1eb355] text-white px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all"
    >
      <MessageCircle size={18} /> Join Now
    </a>
  </div>
);

export const Home: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const arrivalsRef = useRef<HTMLElement>(null);

  // React Query Hook
  const { data, isLoading } = useNewArrivals(currentPage, PAGE_SIZE);

  const products = data?.products || [];
  const total = data?.total || 0;

  /* ---------------- REVEAL ANIMATIONS ---------------- */
  useEffect(() => {
    // Only run observer if we have products to reveal
    if (products.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("active")
        ),
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [products]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    arrivalsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-black min-h-screen text-white overflow-x-hidden">
      <SEO
        title="Wholesale Textile Supplier in Surat | Sai Satguru Textile"
        description="Sai Satguru Textile: Trusted wholesale textile trader in Surat, Gujarat. Sourcing premium sarees, kurtis, and dress materials for bulk buyers globally."
      />
      {/* HERO SECTION - Premium Pure CSS Overlays */}
      <section className="relative min-h-[60vh] md:h-[90vh] flex items-center justify-center pt-32 pb-16 md:pt-0 md:pb-0 overflow-hidden">

        {/* Luxury Text Marquee (Zero Image Assets) */}
        <div className="marquee-container">
          <div className="marquee-content">
            SAI SATGURU TEXTILE • ESTABLISHED IN SURAT • PREMIUM WHOLESALE •
          </div>
        </div>

        <div className="relative z-10 text-center w-full max-w-4xl px-6">

          {/* SEO Optimized H1 - Elegant Kicker */}
          <h1 className="text-brand-gold text-[9px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold mb-4 md:mb-6 reveal-text reveal-text-1 break-words">
            Wholesale Textile Supplier in Surat
          </h1>

          {/* Branding Headline - Demoted to H2 but visually H1 */}
          <h2 className="font-serif text-4xl md:text-7xl mb-5 md:mb-8 leading-tight break-words reveal-text reveal-text-2">
            From Surat <br />
            <span className="text-gradient-gold">to the World</span>
          </h2>

          <p className="text-white/60 mb-10 md:mb-12 text-xs md:text-base max-w-2xl mx-auto leading-relaxed px-2 reveal-text reveal-text-3 font-light">
            Your trusted partner for premium wholesale sarees, dress materials, and kurtis. Sourced from India's textile capital.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 w-full max-w-xs md:max-w-none mx-auto reveal-text reveal-text-4">
            <a
              href="#new-arrivals"
              className="glass-btn glass-btn-gold text-white px-8 py-4 md:py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all rounded-sm"
            >
              View Latest Collections
            </a>
            <Link
              to="/contact"
              className="glass-btn text-white px-8 py-4 md:py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all rounded-sm"
            >
              Contact Surat Showroom
            </Link>
          </div>
        </div>
      </section>

      {/* SEO CONTENT SECTION - Minimal & Clean */}
      <section className="py-12 md:py-16 bg-neutral-950 border-b border-white/5">
        <div className="container mx-auto px-4 text-center max-w-3xl reveal">
          <span className="text-brand-gold text-[10px] uppercase tracking-widest mb-2 block">
            ESTABLISHED IN SURAT, GUJARAT
          </span>
          <h3 className="font-serif text-2xl md:text-3xl mb-4 md:mb-6 text-white">
            Premium Textile Sourcing Hub
          </h3>
          <p className="text-white/50 leading-relaxed text-sm md:text-base">
            Located in the heart of <strong>Surat, Gujarat</strong>, Sai Satguru Textile stands as a premier
            <strong> wholesale textile trader</strong>. We specialize in high-quality
            <strong> bulk sarees, kurtis, and dress materials</strong>, bridging the gap between
            traditional Indian craftsmanship and modern global markets.
          </p>
        </div>
      </section>

      {/* NEW ARRIVALS */}
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
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors ${currentPage === i + 1
                          ? "bg-brand-gold text-black"
                          : "text-white/50 hover:text-white"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
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

      {/* VALUES */}
      <section className="py-12 md:py-24 bg-black border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto px-6">
          <div className="text-center flex flex-col items-center">
            <ShieldCheck className="mb-6 text-brand-gold" size={32} />
            <h3 className="font-serif text-xl mb-4 text-white">Quality Assurance</h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Stringent quality control to ensure every piece meets our premium standards.
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-brand-gold text-brand-gold mb-6 font-bold text-xs italic">
              SS
            </div>
            <h3 className="font-serif text-xl mb-4 text-white">Direct from Surat</h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Sourced directly from India's textile capital to offer unmatched value.
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <MessageCircle className="mb-6 text-brand-gold" size={32} />
            <h3 className="font-serif text-xl mb-4 text-white">Expert Support</h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Dedicated wholesale support to help grow your business.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
