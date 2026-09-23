import Image from 'next/image';
import Link from 'next/link';
import { Gem, Truck, Globe, Handshake, ArrowUpRight } from 'lucide-react';
import { HeroCategoryCard } from './HeroCategoryCard';
import { CONTACT_INFO } from '../lib/constants';

interface HeroCategoryDef {
  label: string;
  href: string;
  /** Static image — drop the file at /public/images/hero/<slug>.jpg (or .png/.webp)
   *  and it will render automatically. Until then, HeroCategoryCard shows a
   *  gold monogram placeholder instead of a broken image. */
  image: string;
}

// Order mirrors the real, live category pages on saisatgurutextile.com/category/*
const HERO_CATEGORIES: HeroCategoryDef[] = [
  { label: 'Saree', href: '/category/saree', image: '/images/hero/saree.webp' },
  { label: 'Suits', href: '/category/suits', image: '/images/hero/suits.webp' },
  { label: 'Lehenga', href: '/category/lehenga', image: '/images/hero/lehenga.webp' },
  { label: 'Kurties', href: '/category/kurties', image: '/images/hero/kurties.webp' },
  { label: 'Bedsheet', href: '/category/bedsheet-2', image: '/images/hero/bedsheet.webp' },
  { label: 'IndoWestern', href: '/category/indowestern', image: '/images/hero/indowestern.webp' },
  { label: 'Gown', href: '/category/gown', image: '/images/hero/gown.webp' },
  { label: 'Mens Wear', href: '/category/mens-wear', image: '/images/hero/mens-wear.webp' },
  { label: 'Kids Wear', href: '/category/kids-wear', image: '/images/hero/kids-wear.webp' },
  { label: 'Bottomwear', href: '/category/jeans', image: '/images/hero/bottomwear.webp' },
  { label: 'Cord Set', href: '/category/cord-set', image: '/images/hero/cord-set.webp' },
  { label: 'Jewellery', href: '/category/jewellery', image: '/images/hero/jewellery.webp' },
  { label: 'Lounge Wear', href: '/category/lounge-wear', image: '/images/hero/lounge-wear.webp' },
  { label: 'Fabrics', href: '/category/fabrics', image: '/images/hero/fabrics.webp' },
];

const TRUST_POINTS = [
  { icon: Gem, title: 'Premium Quality', desc: 'Sourced from trusted manufacturers' },
  { icon: Truck, title: 'Bulk Supply', desc: 'For growing businesses' },
  { icon: Globe, title: 'Pan India & Global', desc: 'Delivering worldwide' },
  { icon: Handshake, title: 'Trusted Partner', desc: 'For 1000+ businesses' },
];

export function Hero() {
  const catalogueWhatsAppHref = `https://wa.me/${CONTACT_INFO.whatsapp1.replace(/\D/g, '')}?text=${encodeURIComponent(
    'Hi, I would like to request your wholesale textile catalogue.'
  )}`;

  return (
    <section className="relative w-full overflow-hidden bg-black pt-28 pb-14 md:pt-36 md:pb-20 lg:min-h-[94vh] lg:flex lg:items-center">
      {/* Background — real textile photography behind the whole hero */}
      <Image
        src="/images/hero/hero-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60" />

      {/* Ambient gold glow — purely decorative */}
      <div
        aria-hidden="true"
        className="absolute -top-1/4 right-0 w-[55%] h-[70%] rounded-full opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.10), transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.08), transparent 70%)', filter: 'blur(80px)' }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1800px] px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">

          {/* ── Left: editorial copy ─────────────────────────────── */}
          <div className="max-w-xl motion-safe:animate-fade-in-up">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.35em] text-[#d4af37] mb-5 md:mb-6">
              Wholesale Textiles &bull; Surat, India
            </p>

            <h1 className="font-serif text-4xl md:text-6xl lg:text-[3.4rem] xl:text-6xl leading-[1.05] mb-6 md:mb-8 text-white">
              Every Style.<br />
              Every Occasion.<br />
              <span className="text-gradient-gold">One Destination.</span>
            </h1>

            <p className="text-white/55 text-sm md:text-base font-light leading-relaxed mb-9 md:mb-11 max-w-md">
              From ethnic to everyday, discover a complete textile range sourced from Surat for retailers, boutiques and businesses worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 md:mb-16">
              <Link
                href="#new-arrivals"
                className="inline-flex items-center justify-center gap-2 bg-[#d4af37] text-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm"
              >
                Explore Collections <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <a
                href={catalogueWhatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] transition-colors rounded-sm"
              >
                Get Wholesale Catalogue <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-8 max-w-md">
              {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col gap-2.5">
                  <Icon size={22} className="text-[#d4af37]" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white">{title}</p>
                    <p className="text-[11px] text-white/40 font-light leading-snug mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: editorial category mosaic ─────────────────── */}
          <div className="relative motion-safe:animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-3">
              {HERO_CATEGORIES.map((cat, i) => (
                <HeroCategoryCard
                  key={cat.href}
                  href={cat.href}
                  label={cat.label}
                  image={cat.image}
                  priority={i === 0}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
