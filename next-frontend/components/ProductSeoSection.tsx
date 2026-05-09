import React from 'react';
import Link from 'next/link';
import { Product, Category } from '../lib/types';
import { 
  isGenericProduct, 
  toDisplayCase
} from '../lib/product';
import { normalizeSlug } from '../lib/api';
import { optimizedImageUrl } from '../lib/imageOptimizer';

interface ProductSeoSectionProps {
  product: Product;
  category: Category | null;
}


export const ProductSeoSection: React.FC<ProductSeoSectionProps> = ({
  product,
  category,
}) => {
  const isBranded = !isGenericProduct(product.brandName);
  const rawCatLabel = category?.label || category?.name || '';
  const catLabel = toDisplayCase(rawCatLabel);
  const catSlug = category?.slug || '';
  const brandSlug = product.brandSlug ? normalizeSlug(product.brandSlug) : (product.brandName ? normalizeSlug(product.brandName) : null);

  const faqs = [
    {
      q: `Can I enquire about ${product.name} on WhatsApp?`,
      a: `Yes. You can contact Sai Satguru Textile directly on WhatsApp to enquire about pricing, minimum order quantity, and current availability for ${product.name}.`,
    },
    {
      q: `Are GST and shipping charges extra for ${product.brandName || 'these'} products?`,
      a: `Yes. GST applicable to the textile category and domestic / international shipping charges are billed separately. Please enquire via WhatsApp for a complete quote.`,
    },
    {
      q: `Can I request more styles from ${product.brandName || 'this collection'} at Sai Satguru Textile?`,
      a: `Yes. Sai Satguru Textile maintains dedicated collections where you can browse additional styles. You can also contact our team for catalogue access and bulk sourcing.`,
    },
    {
       q: `Is ${product.name} suitable for boutique or reseller sourcing?`,
       a: `This product is available on an enquiry basis for wholesale buyers, boutique stockists, and resellers. Contact us on WhatsApp to discuss pricing and terms.`,
    }
  ];

  const aboutText = isBranded
    ? `Sai Satguru Textile offers ${product.name}${catLabel ? ` — a ${catLabel.toLowerCase()} catalogue product` : ''} from ${product.brandName}, available for wholesale enquiry. This page is designed for boutique owners, resellers, and catalogue buyers who source directly from Surat. Browse the full ${product.brandName} collection on our brand page, or contact our team on WhatsApp for pricing, minimum order quantities, and dispatch details.`
    : `Sai Satguru Textile offers ${product.name}${catLabel ? ` in the ${catLabel.toLowerCase()} category` : ''}, available for wholesale enquiry by retailers, boutique stockists, and resellers. Browse more ${catLabel || 'catalogue'} products on our collection page, or contact our team directly on WhatsApp for sourcing support, pricing, and availability.`;

  return (
    <div className="mt-16 border-t border-white/10 pt-14 space-y-14">
      <section>
        <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">About This Product</span>
        <h2 className="font-serif text-2xl md:text-3xl text-white mb-6">
          {isBranded ? `${product.name} by ${product.brandName}` : `${product.name}${catLabel ? ` — ${catLabel}` : ''}`}
        </h2>
        <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-3xl">{aboutText}</p>
      </section>

      <section>
        <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">Common Questions</span>
        <h2 className="font-serif text-2xl md:text-3xl text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3 max-w-3xl">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group border border-white/10 rounded-lg bg-white/[0.02] open:bg-white/[0.04] transition-colors duration-300">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none text-white/80 text-sm font-medium hover:text-white transition-colors duration-200">
                <span>{faq.q}</span>
                <span className="ml-4 shrink-0 w-5 h-5 flex items-center justify-center rounded-full border border-white/20 text-[#d4af37]/80 text-xs font-bold group-open:rotate-45 transition-transform duration-300">+</span>
              </summary>
              <p className="px-5 pb-4 pt-1 text-white/55 text-sm leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>



      <section className="flex items-center gap-4 pt-2 pb-2">
        <div className="h-px flex-grow bg-white/10" />
        {isBranded && brandSlug ? (
          <Link href={`/brand/${brandSlug}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-white/40 hover:text-[#d4af37] transition-colors">
            <span>Browse Full {product.brandName} Collection</span>
            <span className="text-[#d4af37]">→</span>
          </Link>
        ) : catSlug ? (
          <Link href={`/category/${catSlug}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-white/40 hover:text-[#d4af37] transition-colors">
            <span>Browse Full {catLabel || 'Collection'}</span>
            <span className="text-[#d4af37]">→</span>
          </Link>
        ) : null}
        <div className="h-px flex-grow bg-white/10" />
      </section>
    </div>
  );
};
