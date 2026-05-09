import React from "react";
import Link from 'next/link';
import { ShieldCheck, MessageCircle, ArrowRight } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { CONTACT_INFO } from "../lib/constants";
import { fetchNewArrivals } from "../lib/api";

const PREVIEW_SIZE = 8;

const CommunityCTA = () => (
  <div className="mt-20 bg-gradient-to-r from-[#0a0a0a] to-[#121212] border border-white/5 p-8 md:p-12 text-center rounded-sm">
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

export default async function Home() {
  // Fetch only a small preview — no pagination on homepage
  const { products } = await fetchNewArrivals(1, PREVIEW_SIZE);

  return (
    <div className="bg-black min-h-screen text-white overflow-x-hidden">
      {/* HERO SECTION - Premium Pure CSS Overlays */}
      <section className="relative min-h-[60vh] md:h-[90vh] flex items-center justify-center pt-32 pb-16 md:pt-0 md:pb-0 overflow-hidden">
        {/* Luxury Text Marquee */}
        <div className="marquee-container">
          <div className="marquee-content">
            SAI SATGURU TEXTILE • ESTABLISHED IN SURAT • PREMIUM WHOLESALE • 
          </div>
        </div>

        <div className="relative z-10 text-center w-full max-w-4xl px-6">
          <h1 className="text-[#d4af37] text-[9px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold mb-4 md:mb-6 reveal-text reveal-text-1 break-words">
            Wholesale Textile Supplier in Surat
          </h1>

          <h2 className="font-serif text-4xl md:text-7xl mb-5 md:mb-8 leading-tight break-words reveal-text reveal-text-2">
            From Surat <br />
            <span className="text-gradient-gold">to the World</span>
          </h2>

          <p className="text-white/60 mb-10 md:mb-12 text-xs md:text-base max-w-2xl mx-auto leading-relaxed px-2 reveal-text reveal-text-3 font-light">
            Your trusted partner for premium wholesale sarees, dress materials, and kurtis. Sourced from India&apos;s textile capital.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 w-full max-w-xs md:max-w-none mx-auto reveal-text reveal-text-4">
            <Link
              href="/new-arrivals"
              className="glass-btn glass-btn-gold text-white px-8 py-4 md:py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all rounded-sm"
            >
              View Latest Collections
            </Link>
            <Link
              href="/contact"
              className="glass-btn text-white px-8 py-4 md:py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all rounded-sm"
            >
              Contact Surat Showroom
            </Link>
          </div>
        </div>
      </section>

      {/* SEO CONTENT SECTION - Minimal & Clean */}
      <section className="py-12 md:py-16 bg-[#050505] border-b border-white/5">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="text-[#d4af37] text-[10px] uppercase tracking-widest mb-2 block">
            ESTABLISHED IN SURAT, GUJARAT
          </span>
          <p className="text-white/60 font-serif text-sm leading-relaxed mb-4">
            Sai Satguru Textile is a premier wholesale manufacturer based in Surat, specializing in high-quality Kurti Sets, Sarees, Lehengas, and Top Brands like Ramsha, Fandy, and Gulkayra. With decades of manufacturing excellence, we provide unbeatable wholesale prices globally.
          </p>
        </div>
      </section>

      {/* NEW ARRIVALS — Preview Section (no pagination) */}
      <section
        id="new-arrivals"
        className="py-12 md:py-24 px-4 md:px-12 bg-[#050505]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-6xl font-serif mb-2 md:mb-4">
              New Arrivals
            </h2>
            <p className="text-white/40 italic text-sm md:text-base">
              Our latest designs, automatically updated across all categories.
            </p>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {products.map((product, idx) => (
                  <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                    <ProductCard
                      product={product}
                      priority={idx < 4}
                    />
                  </div>
                ))}
              </div>

              {/* "View All" CTA — drives traffic to the real SEO page */}
              <div className="mt-12 md:mt-16 text-center">
                <Link
                  href="/new-arrivals"
                  className="inline-flex items-center gap-3 border border-[#d4af37]/40 hover:border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black px-10 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-300 rounded-sm"
                >
                  View All New Arrivals <ArrowRight size={16} />
                </Link>
              </div>
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
            <ShieldCheck className="mb-6 text-[#d4af37]" size={32} />
            <h3 className="font-serif text-xl mb-4 text-white">Quality Assurance</h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Stringent quality control to ensure every piece meets our premium standards.
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#d4af37] text-[#d4af37] mb-6 font-bold text-xs italic">
              SS
            </div>
            <h3 className="font-serif text-xl mb-4 text-white">Direct from Surat</h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Sourced directly from India&apos;s textile capital to offer unmatched value.
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <MessageCircle className="mb-6 text-[#d4af37]" size={32} />
            <h3 className="font-serif text-xl mb-4 text-white">Expert Support</h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Dedicated wholesale support to help grow your business.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
