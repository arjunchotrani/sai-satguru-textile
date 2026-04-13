import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Brand, Product, Category } from '../types';
import { normalizeSlug } from '../utils/slug';

// ─── Constants ─────────────────────────────────────────────────────────────

const SITE_URL = 'https://www.saisatgurutextile.com';
const WHATSAPP_NUMBER = '+918200103821';

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Derive distinct categories from a product list, matched against the full
 * categories array (which is already fetched by the parent page).
 */
function deriveCategories(products: Product[], categories: Category[]): Category[] {
  const presentIds = new Set(products.map(p => p.categoryId));
  return categories.filter(c => presentIds.has(c.id));
}

/**
 * Build an FAQ list that is reused for both the visible section and the JSON-LD.
 */
export function buildFaqs(brandName: string): { q: string; a: string }[] {
  return [
    {
      q: `What products are available under ${brandName} at Sai Satguru Textile?`,
      a: `Sai Satguru Textile offers a curated collection of wholesale textile products from ${brandName}, including catalogue sets, ethnic wear, and related styles. Browse the full collection above or contact us via WhatsApp for the latest availability.`,
    },
    {
      q: `Can I enquire about ${brandName} products through WhatsApp?`,
      a: `Yes. You can reach our sales team directly on WhatsApp to enquire about pricing, minimum order quantities, and current availability for any ${brandName} product listed on our platform.`,
    },
    {
      q: `Does Sai Satguru Textile offer brand-wise product browsing?`,
      a: `Yes. Sai Satguru Textile provides dedicated brand collection pages so wholesale buyers and retailers can conveniently browse all products from a specific brand in one place, making catalogue discovery and sourcing easier.`,
    },
    {
      q: `How can I explore more products from ${brandName}?`,
      a: `Use the category filters above the product grid to narrow down the ${brandName} collection by type. You can also browse all brands at Sai Satguru Textile to discover similar or related collections.`,
    },
  ];
}

// ─── JSON-LD Builder ────────────────────────────────────────────────────────

interface JsonLdProps {
  brand: Brand;
  products: Product[];
  categories: Category[];
}

export const BrandJsonLd: React.FC<JsonLdProps> = ({ brand, products, categories }) => {
  const canonicalSlug = normalizeSlug(brand.slug || brand.name);
  const canonicalUrl = `${SITE_URL}/brand/${canonicalSlug}`;
  const pageTitle = `${brand.name} Collection at Sai Satguru Textile | Wholesale Supplier in Surat`;
  const pageDesc = `Explore the latest ${brand.name} collection at Sai Satguru Textile. Discover curated wholesale textile products, catalogue styles, and enquiry-based sourcing support from Surat.`;

  const faqs = buildFaqs(brand.name);

  // ItemList — use up to 20 products from the full brand list
  const itemListProducts = products.slice(0, 20);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      // CollectionPage
      {
        '@type': 'CollectionPage',
        name: pageTitle,
        url: canonicalUrl,
        description: pageDesc,
      },
      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Brands',
            item: `${SITE_URL}/brands`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: brand.name,
            item: canonicalUrl,
          },
        ],
      },
      // ItemList
      ...(itemListProducts.length > 0
        ? [
            {
              '@type': 'ItemList',
              name: `${brand.name} Products`,
              itemListElement: itemListProducts.map((p, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                name: p.name,
                url: `${SITE_URL}/product/${p.slug}`,
                ...(p.images && p.images.length > 0
                  ? { image: p.images[0] }
                  : {}),
              })),
            },
          ]
        : []),
      // FAQPage
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema, null, 0)}</script>
    </Helmet>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────

interface BrandSeoContentProps {
  brand: Brand;
  /** Full brand product list — not just the current page's slice */
  products: Product[];
  categories: Category[];
}

export const BrandSeoContent: React.FC<BrandSeoContentProps> = ({
  brand,
  products,
  categories,
}) => {
  const brandCategories = deriveCategories(products, categories);
  const faqs = buildFaqs(brand.name);
  const totalCount = products.length;
  const categoryNames = brandCategories.map(c => c.label || c.name || '').filter(Boolean);

  // Build a short dynamic "About" sentence mentioning real data
  const categorySnippet =
    categoryNames.length > 0
      ? ` across ${categoryNames.length === 1
          ? `the ${categoryNames[0]} range`
          : `categories including ${categoryNames.slice(0, 3).join(', ')}${categoryNames.length > 3 ? ', and more' : ''}`}`
      : '';

  return (
    <div className="mt-20 border-t border-white/10 pt-16 space-y-14">

      {/* ── A. About {Brand Name} ─────────────────────────────────── */}
      <section aria-labelledby="brand-about-heading">
        <span className="text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">
          About the Brand
        </span>
        <h2
          id="brand-about-heading"
          className="font-serif text-2xl md:text-3xl text-white mb-6"
        >
          About {brand.name}
        </h2>
        <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-3xl">
          Sai Satguru Textile provides a dedicated brand collection page for{' '}
          <strong className="text-white/80">{brand.name}</strong>, curating{' '}
          {totalCount > 0 ? `${totalCount} wholesale textile product${totalCount !== 1 ? 's' : ''}` : 'a curated range of wholesale textile products'}
          {categorySnippet}.
          This page is intended to support catalogue-style discovery and enquiry-led wholesale
          sourcing for retailers, boutique owners, and wholesale buyers. Browse the full{' '}
          {brand.name} collection above, or use the category filter to narrow your search.
          For pricing, availability, and minimum order details, you can reach our team directly
          via WhatsApp.
        </p>
      </section>

      {/* ── B. Why Explore {Brand Name} ──────────────────────────── */}
      <section aria-labelledby="brand-why-heading">
        <span className="text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">
          Sourcing Made Simple
        </span>
        <h2
          id="brand-why-heading"
          className="font-serif text-2xl md:text-3xl text-white mb-6"
        >
          Why Explore {brand.name} at Sai Satguru Textile
        </h2>
        <ul className="space-y-3 text-white/60 text-sm md:text-base">
          <li className="flex items-start gap-3">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-gold/70 shrink-0" />
            <span>
              <strong className="text-white/80">Dedicated Brand Browsing</strong> — All{' '}
              {brand.name} products are grouped under one collection page for faster discovery
              and comparison.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-gold/70 shrink-0" />
            <span>
              <strong className="text-white/80">Direct Enquiry Support</strong> — Reach our team
              on WhatsApp for the most up-to-date pricing, GST details, and dispatch timelines
              for any {brand.name} item.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-gold/70 shrink-0" />
            <span>
              <strong className="text-white/80">Single-Page Product Visibility</strong> — Find
              all available styles, sets, and variants from this brand without navigating across
              multiple catalogue sections.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-gold/70 shrink-0" />
            <span>
              <strong className="text-white/80">Wholesale Catalogue Discovery</strong> — Designed
              for wholesale buyers, boutique stockists, and retailers who prefer structured,
              brand-wise sourcing directly from Surat.
            </span>
          </li>
        </ul>
      </section>

      {/* ── C. Available Categories ───────────────────────────────── */}
      {brandCategories.length > 0 && (
        <section aria-labelledby="brand-categories-heading">
          <span className="text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">
            Product Types
          </span>
          <h2
            id="brand-categories-heading"
            className="font-serif text-2xl md:text-3xl text-white mb-6"
          >
            Available Categories Under {brand.name}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {brandCategories.map(cat => (
              <li key={cat.id}>
                {cat.slug ? (
                  <Link
                    to={`/category/${cat.slug}`}
                    className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 text-xs uppercase tracking-wider font-bold hover:border-brand-gold/50 hover:text-brand-gold transition-all duration-300"
                  >
                    {cat.label || cat.name}
                  </Link>
                ) : (
                  <span className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs uppercase tracking-wider font-bold">
                    {cat.label || cat.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── D. FAQs ─────────────────────────────────────────────── */}
      <section aria-labelledby="brand-faq-heading">
        <span className="text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">
          Common Questions
        </span>
        <h2
          id="brand-faq-heading"
          className="font-serif text-2xl md:text-3xl text-white mb-6"
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-3 max-w-3xl">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group border border-white/10 rounded-lg bg-white/[0.02] open:bg-white/[0.04] transition-colors duration-300"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none text-white/80 text-sm font-medium hover:text-white transition-colors duration-200">
                <span>{faq.q}</span>
                {/* + / − toggle */}
                <span className="ml-4 shrink-0 w-5 h-5 flex items-center justify-center rounded-full border border-white/20 text-brand-gold/80 text-xs font-bold group-open:rotate-45 transition-transform duration-300">
                  +
                </span>
              </summary>
              <p className="px-5 pb-4 pt-1 text-white/55 text-sm leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── E. Browse All Brands CTA ─────────────────────────────── */}
      <section
        aria-label="Browse all brands"
        className="flex items-center gap-4 pt-2 pb-2"
      >
        <div className="h-px flex-grow bg-white/10" />
        <Link
          to="/brands"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-white/40 hover:text-brand-gold transition-colors duration-300"
        >
          <span>Browse All Brands</span>
          <span className="text-brand-gold">→</span>
        </Link>
        <div className="h-px flex-grow bg-white/10" />
      </section>

    </div>
  );
};

export default BrandSeoContent;
