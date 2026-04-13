import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { Product, Category } from '../types';
import { normalizeSlug } from '../utils/slug';
import { optimizedImageUrl } from '../utils/imageOptimizer';

// ─── Constants ─────────────────────────────────────────────────────────────

const SITE_URL = 'https://saisatgurutextile.com';

// ─── Mode Detection ─────────────────────────────────────────────────────────

const GENERIC_BRAND_VALUES = new Set(['generic', 'GENERIC', 'Generic', '', null, undefined]);

export function isGenericProduct(brandName?: string | null): boolean {
  if (!brandName) return true;
  return GENERIC_BRAND_VALUES.has(brandName as any) || brandName.trim() === '';
}

// ─── SEO Helpers ────────────────────────────────────────────────────────────

export function buildProductSeoTitle(
  productName: string,
  brandName?: string | null,
  categoryLabel?: string | null
): string {
  const isGeneric = isGenericProduct(brandName);
  const catPart = categoryLabel ? `${categoryLabel} ` : '';
  if (isGeneric) {
    return `${productName} | ${catPart}Wholesale at Sai Satguru Textile`;
  }
  return `${productName} | ${brandName} at Sai Satguru Textile`;
}

export function buildProductSeoDesc(
  productName: string,
  brandName?: string | null,
  categoryLabel?: string | null,
  rawDescription?: string | null
): string {
  const isGeneric = isGenericProduct(brandName);
  const cat = categoryLabel || 'textile';

  if (isGeneric) {
    return `Explore ${productName} — a ${cat.toLowerCase()} catalogue product available for wholesale enquiry at Sai Satguru Textile, Surat. Contact us on WhatsApp for pricing and availability.`;
  }
  const cleanDesc = rawDescription
    ? rawDescription.replace(/\n/g, ' ').replace(/[*_~]/g, '').trim().substring(0, 70)
    : '';
  const descPart = cleanDesc ? ` ${cleanDesc}.` : '';
  return `Explore ${productName} by ${brandName} at Sai Satguru Textile.${descPart} Wholesale ${cat.toLowerCase()} sourcing from Surat — enquire via WhatsApp.`;
}

// ─── FAQ Builder ─────────────────────────────────────────────────────────────

function buildProductFaqs(
  isBranded: boolean,
  productName: string,
  brandName?: string | null,
  categoryLabel?: string | null
): { q: string; a: string }[] {
  const cat = categoryLabel || 'this category';
  if (isBranded) {
    return [
      {
        q: `Can I enquire about ${productName} on WhatsApp?`,
        a: `Yes. You can contact Sai Satguru Textile directly on WhatsApp to enquire about pricing, minimum order quantity, and current availability for ${productName}.`,
      },
      {
        q: `Are GST and shipping charges extra for ${brandName} products?`,
        a: `Yes. GST applicable to the textile category and domestic / international shipping charges are billed separately. Please enquire via WhatsApp for a complete quote.`,
      },
      {
        q: `Can I request more styles from ${brandName} at Sai Satguru Textile?`,
        a: `Yes. Sai Satguru Textile maintains a dedicated ${brandName} collection page where you can browse additional styles. You can also contact our team for catalogue access and bulk sourcing.`,
      },
      {
        q: `Is ${productName} suitable for boutique or reseller sourcing?`,
        a: `This product is available on an enquiry basis for wholesale buyers, boutique stockists, and resellers. Contact us on WhatsApp to discuss pricing and terms.`,
      },
    ];
  }
  return [
    {
      q: `Can I enquire about ${productName} on WhatsApp?`,
      a: `Yes. Reach our Sai Satguru Textile team on WhatsApp to enquire about pricing, minimum order quantity, and availability for ${productName}.`,
    },
    {
      q: `Are GST and shipping charges extra?`,
      a: `Yes. Applicable GST and shipping charges are billed separately. Please enquire on WhatsApp for a complete cost breakdown before placing an order.`,
    },
    {
      q: `Do you carry more ${cat} options similar to this?`,
      a: `Yes. Browse our full ${cat} collection on Sai Satguru Textile to discover more catalogue styles in this category available for wholesale sourcing.`,
    },
    {
      q: `Is this product suitable for boutique sourcing?`,
      a: `This product is available for wholesale enquiry by boutique owners, resellers, and retail stockists. Contact us on WhatsApp to discuss pricing and sourcing terms.`,
    },
  ];
}

// ─── JSON-LD Component ───────────────────────────────────────────────────────

interface ProductJsonLdProps {
  product: Product;
  category: Category | null;
  canonicalUrl: string;
  seoTitle: string;
  seoDesc: string;
}

export const ProductJsonLd: React.FC<ProductJsonLdProps> = ({
  product,
  category,
  canonicalUrl,
  seoTitle,
  seoDesc,
}) => {
  const isBranded = !isGenericProduct(product.brandName);
  const brandSlug = product.brandSlug
    ? normalizeSlug(product.brandSlug)
    : product.brandName
    ? normalizeSlug(product.brandName)
    : null;

  const faqs = buildProductFaqs(
    isBranded,
    product.name,
    product.brandName,
    category?.label || category?.name
  );

  // BreadcrumbList — build the most accurate chain available
  const breadcrumbItems: { name: string; item: string }[] = [
    { name: 'Home', item: SITE_URL },
  ];
  if (category?.slug) {
    breadcrumbItems.push({
      name: category.label || category.name || 'Category',
      item: `${SITE_URL}/category/${category.slug}`,
    });
  }
  if (isBranded && brandSlug) {
    breadcrumbItems.push({
      name: product.brandName!,
      item: `${SITE_URL}/brand/${brandSlug}`,
    });
  }
  breadcrumbItems.push({ name: product.name, item: canonicalUrl });

  // Product schema — only populate fields we actually have
  const productSchema: Record<string, any> = {
    '@type': 'Product',
    name: product.name,
    url: canonicalUrl,
    description: seoDesc,
    image: product.images && product.images.length > 0 ? product.images : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.basePriceINR,
      url: canonicalUrl,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Sai Satguru Textile',
      },
    },
  };

  // Only add a real brand node — never emit "GENERIC"
  if (isBranded && product.brandName) {
    productSchema.brand = {
      '@type': 'Brand',
      name: product.brandName,
    };
  }

  if (category?.label || category?.name) {
    productSchema.category = category.label || category.name;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      productSchema,
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          item: item.item,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
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

// ─── Related Products Mini-Card ──────────────────────────────────────────────

const RelatedCard: React.FC<{ product: Product }> = ({ product }) => {
  const imgUrl = product.images && product.images.length > 0
    ? optimizedImageUrl(product.images[0], 'thumbnail')
    : '';

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col gap-2 bg-white/[0.03] border border-white/10 rounded-lg overflow-hidden hover:border-brand-gold/30 transition-all duration-300"
    >
      {imgUrl && (
        <div className="aspect-[3/4] overflow-hidden bg-white/5">
          <img
            src={imgUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      <div className="px-3 pb-3">
        <p className="text-[11px] uppercase tracking-wider font-bold text-white/70 group-hover:text-brand-gold transition-colors line-clamp-2 leading-snug">
          {product.name}
        </p>
      </div>
    </Link>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

interface ProductSeoContentProps {
  product: Product;
  category: Category | null;
  relatedProducts: Product[];
}

export const ProductSeoContent: React.FC<ProductSeoContentProps> = ({
  product,
  category,
  relatedProducts,
}) => {
  const isBranded = !isGenericProduct(product.brandName);
  const catLabel = category?.label || category?.name || '';
  const catSlug = category?.slug || '';
  const brandSlug = product.brandSlug
    ? normalizeSlug(product.brandSlug)
    : product.brandName
    ? normalizeSlug(product.brandName)
    : null;

  const faqs = buildProductFaqs(isBranded, product.name, product.brandName, catLabel);

  // Limit related products to 4, already excluding current in parent
  const visibleRelated = relatedProducts.slice(0, 4);

  const aboutText = isBranded
    ? `Sai Satguru Textile offers ${product.name}${catLabel ? ` — a ${catLabel.toLowerCase()} catalogue product` : ''} from ${product.brandName}, available for wholesale enquiry. This page is designed for boutique owners, resellers, and catalogue buyers who source directly from Surat. Browse the full ${product.brandName} collection on our brand page, or contact our team on WhatsApp for pricing, minimum order quantities, and dispatch details.`
    : `Sai Satguru Textile offers ${product.name}${catLabel ? ` in the ${catLabel.toLowerCase()} category` : ''}, available for wholesale enquiry by retailers, boutique stockists, and resellers. Browse more ${catLabel || 'catalogue'} products on our collection page, or contact our team directly on WhatsApp for sourcing support, pricing, and availability.`;

  const whyPoints = isBranded
    ? [
        { strong: 'Catalogue Sourcing', body: `Browse all ${product.brandName} styles in one place and discover new seasonal additions for your boutique inventory.` },
        { strong: 'WhatsApp Enquiry', body: 'Connect directly with our team on WhatsApp for the most current pricing, availability, and MOQ details.' },
        { strong: 'Retail & Reseller Friendly', body: 'Our wholesale enquiry model supports boutique owners, Tier-2 city resellers, and online re-sellers sourcing branded ethnic wear.' },
        { strong: 'Surat Direct', body: 'Products are sourced and dispatched from Surat — a key hub for ethnic wear and catalogue textiles in India.' },
      ]
    : [
        { strong: 'Category-Wise Browsing', body: `Explore the full ${catLabel || 'collection'} and discover more styles suitable for your boutique or retail inventory.` },
        { strong: 'Wholesale Enquiry Support', body: 'Contact us on WhatsApp for wholesale pricing, minimum order quantities, and dispatch timelines.' },
        { strong: 'Boutique & Reseller Friendly', body: 'Our enquiry-based sourcing model supports boutique owners, resellers, and retail stockists across India.' },
        { strong: 'Surat Direct', body: 'Products are sourced and dispatched from Surat — one of India\'s premier hubs for ethnic wear textiles.' },
      ];

  return (
    <div className="mt-16 border-t border-white/10 pt-14 space-y-14">

      {/* ── A. About This Product ─────────────────────────────── */}
      <section aria-labelledby="product-about-heading">
        <span className="text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">
          About This Product
        </span>
        <h2
          id="product-about-heading"
          className="font-serif text-2xl md:text-3xl text-white mb-6"
        >
          {isBranded
            ? `${product.name} by ${product.brandName}`
            : `${product.name}${catLabel ? ` — ${catLabel}` : ''}`}
        </h2>
        <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-3xl">
          {aboutText}
        </p>
      </section>

      {/* ── B. Why Buyers Enquire ─────────────────────────────── */}
      <section aria-labelledby="product-why-heading">
        <span className="text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">
          Sourcing Insights
        </span>
        <h2
          id="product-why-heading"
          className="font-serif text-2xl md:text-3xl text-white mb-6"
        >
          {isBranded
            ? `Why Buyers Enquire for ${product.brandName} Products`
            : `Why Buyers Enquire for ${catLabel || 'This Style'}`}
        </h2>
        <ul className="space-y-3 text-white/60 text-sm md:text-base">
          {whyPoints.map((pt, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-gold/70 shrink-0" />
              <span>
                <strong className="text-white/80">{pt.strong}</strong> — {pt.body}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── C. Wholesale Demand Note (generic national wording) ── */}
      <section aria-label="Wholesale sourcing note">
        <p className="text-white/35 text-sm leading-relaxed max-w-3xl border-l-2 border-brand-gold/20 pl-4 italic">
          {isBranded
            ? `${product.brandName} products are sourced via Sai Satguru Textile by wholesale buyers, boutique owners, and catalogue resellers across major Indian markets. Contact our team on WhatsApp for the most current price list and availability.`
            : `${catLabel ? catLabel + ' products' : 'Products in this category'} at Sai Satguru Textile are available for wholesale enquiry by boutique owners, resellers, and retail stockists seeking catalogue-style sourcing from Surat.`}
        </p>
      </section>

      {/* ── D. FAQs ──────────────────────────────────────────── */}
      <section aria-labelledby="product-faq-heading">
        <span className="text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">
          Common Questions
        </span>
        <h2
          id="product-faq-heading"
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

      {/* ── E. Related Products ───────────────────────────────── */}
      {visibleRelated.length > 0 && (
        <section aria-labelledby="product-related-heading">
          <span className="text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">
            {isBranded ? `More from ${product.brandName}` : `More ${catLabel || 'Products'}`}
          </span>
          <h2
            id="product-related-heading"
            className="font-serif text-2xl md:text-3xl text-white mb-6"
          >
            {isBranded
              ? `More from ${product.brandName}`
              : `Explore More ${catLabel || 'Products'}`}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {visibleRelated.map(p => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── F. Collection CTA ─────────────────────────────────── */}
      <section aria-label="Browse collection" className="flex items-center gap-4 pt-2 pb-2">
        <div className="h-px flex-grow bg-white/10" />
        {isBranded && brandSlug ? (
          <Link
            to={`/brand/${brandSlug}`}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-white/40 hover:text-brand-gold transition-colors duration-300"
          >
            <span>Browse Full {product.brandName} Collection</span>
            <span className="text-brand-gold">→</span>
          </Link>
        ) : catSlug ? (
          <Link
            to={`/category/${catSlug}`}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-white/40 hover:text-brand-gold transition-colors duration-300"
          >
            <span>Browse Full {catLabel || 'Collection'}</span>
            <span className="text-brand-gold">→</span>
          </Link>
        ) : null}
        <div className="h-px flex-grow bg-white/10" />
      </section>

    </div>
  );
};

export default ProductSeoContent;
