export const revalidate = 300;
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchNewArrivals } from '../../lib/api';
import { ProductCard } from '../../components/ProductCard';
import type { Metadata } from 'next';

const PAGE_SIZE = 12;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = parseInt(sp.page || '1', 10);
  const safePage = isNaN(page) || page < 1 ? 1 : page;

  const title = safePage > 1 ? `New Arrivals — Page ${safePage}` : 'New Arrivals';
  const canonical = safePage > 1
    ? `https://saisatgurutextile.com/new-arrivals?page=${safePage}`
    : 'https://saisatgurutextile.com/new-arrivals';

  return {
    title,
    description: 'Shop the latest trending textiles, sarees, and ethnic wear collections at Sai Satguru Textile. Fresh arrivals added daily from Surat.',
    alternates: {
      canonical,
    },
  };
}

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = parseInt(sp.page || '1', 10);
  const { products, total } = await fetchNewArrivals(currentPage, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);





  return (
    <div className="bg-black min-h-screen pt-24 pb-12 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://saisatgurutextile.com' },
              { '@type': 'ListItem', position: 2, name: 'New Arrivals', item: 'https://saisatgurutextile.com/new-arrivals' },
            ],
          })
        }}
      />
      <div className="container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/50 uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-[#d4af37] transition-colors">Home</Link>
          <span className="text-white/20">/</span>
          <span className="text-[#d4af37] font-bold">New Arrivals</span>
        </div>

        {/* Header */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="text-[#d4af37] text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Just In</span>
          <h1 className="font-serif text-4xl md:text-6xl text-white mb-6">
            New Arrivals
          </h1>
          <p className="text-white/40 max-w-2xl mx-auto font-light leading-relaxed">
            Stay ahead of the trend. Explore our latest acquisitions from traditional sarees to contemporary ethnic wear, curated specifically for premium wholesale sourcing.
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="animate-in fade-in duration-1000">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-20 flex items-center justify-center gap-6">
                <Link
                  href={currentPage > 1 ? `/new-arrivals?page=${currentPage - 1}` : '#'}
                  className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-[#d4af37] transition-colors ${currentPage === 1 ? 'pointer-events-none opacity-20' : ''}`}
                >
                  <ChevronLeft size={16} /> Previous
                </Link>

                <div className="hidden md:flex gap-2">
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

                    return pages.map((p, i) => {
                      if (p === '...') {
                        const isLeft = i < pages.length / 2;
                        const jumpTo = isLeft ? Math.max(1, currentPage - 5) : Math.min(totalPages, currentPage + 5);
                        return (
                          <Link
                            key={`ellipsis-${i}`}
                            href={`/new-arrivals?page=${jumpTo}`}
                            className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors text-xs tracking-widest"
                            title={isLeft ? "Jump back 5 pages" : "Jump forward 5 pages"}
                          >
                            •••
                          </Link>
                        );
                      }

                      return (
                        <Link
                          key={i}
                          href={`/new-arrivals?page=${p}`}
                          className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${currentPage === p
                            ? "border-[#d4af37] text-black bg-[#d4af37] shadow-lg shadow-[#d4af37]/30"
                            : "border-white/10 text-white/40 hover:border-[#d4af37]/50 hover:text-white"
                            }`}
                        >
                          {p}
                        </Link>
                      );
                    });
                  })()}
                </div>

                {/* Mobile: simple page indicator */}
                <span className="md:hidden text-white/40 text-xs font-bold">
                  {currentPage} / {totalPages}
                </span>

                <Link
                  href={currentPage < totalPages ? `/new-arrivals?page=${currentPage + 1}` : '#'}
                  className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-[#d4af37] transition-colors ${currentPage === totalPages ? 'pointer-events-none opacity-20' : ''}`}
                >
                  Next <ChevronRight size={16} />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="py-24 text-center border border-white/5 bg-neutral-900/40 rounded-sm">
            <p className="text-white/30 text-lg font-serif italic mb-8">
              No new arrivals found at this moment.
            </p>
            <Link
              href="/collections"
              className="inline-block px-10 py-4 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-all"
            >
              Browse Collections
            </Link>
          </div>
        )}

        {/* SEO CONTENT SECTION */}
        <section className="mt-16 md:mt-20 pt-12 md:pt-14 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-[#d4af37] text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">
              Curated from India&apos;s Textile Capital
            </span>
            <h2 className="font-serif text-2xl md:text-4xl text-white mb-8 leading-tight">
              Latest Wholesale Textile Arrivals from Surat
            </h2>
            <div className="text-white/45 text-sm md:text-base font-light leading-relaxed space-y-4 text-justify md:text-center">
              <p>
                Our new arrivals showcase the freshest collections sourced directly from Surat&apos;s finest manufacturers.
                Whether you are a boutique owner, retail stockist, or wholesale reseller, this page is your gateway to
                the latest trending sarees, kurti sets, lehengas, dress materials, and premium ethnic wear — updated
                frequently to keep your inventory ahead of the curve.
              </p>
              <p>
                Every piece in our catalog is handpicked for quality, design appeal, and wholesale viability.
                From embroidered georgette sarees to contemporary digital-print kurti sets, our fresh arrivals
                reflect what&apos;s moving in the market right now. We work closely with top textile brands and
                independent designers across Surat to bring you collections that sell — at prices that protect
                your margins.
              </p>
              <p>
                Looking for bulk enquiry or catalogue-based sourcing? Reach out via WhatsApp for real-time
                availability, pricing, and MOQ details on any product you see here.
              </p>
            </div>
          </div>

          {/* Trust Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto mt-14 md:mt-16">
            {[
              {
                label: 'Direct from Surat',
                desc: 'Sourced from India\u2019s textile capital with zero middlemen.',
              },
              {
                label: 'Frequently Updated',
                desc: 'New designs and collections added every week across all categories.',
              },
              {
                label: 'Wholesale Enquiry Support',
                desc: 'Dedicated WhatsApp support for pricing, MOQ, and bulk orders.',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="text-center p-6 md:p-8 border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors"
              >
                <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-3">
                  {card.label}
                </h3>
                <p className="text-white/35 text-xs md:text-sm font-light leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
