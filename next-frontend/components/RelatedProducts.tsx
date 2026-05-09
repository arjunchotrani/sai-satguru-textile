import React from 'react';
import Link from 'next/link';
import { fetchProducts } from '../lib/api';
import { Product } from '../lib/types';
import { optimizedImageUrl } from '../lib/imageOptimizer';

interface RelatedProductsProps {
  categoryId: string;
  brandId?: string;
  isBranded: boolean;
  currentProductId: string;
  brandName?: string;
  categoryLabel?: string;
}

const RelatedCard: React.FC<{ product: Product }> = ({ product }) => {
  const imgUrl = product.images?.[0] ? optimizedImageUrl(product.images[0], 'thumbnail') : '';

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-2 bg-white/[0.03] border border-white/10 rounded-lg overflow-hidden hover:border-[#d4af37]/30 transition-all duration-300"
    >
      <div className="aspect-[3/4] overflow-hidden bg-white/5">
        <img
          src={imgUrl}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="px-3 pb-3">
        <p className="text-[11px] uppercase tracking-wider font-bold text-white/70 group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-snug">
          {product.name}
        </p>
      </div>
    </Link>
  );
};

export default async function RelatedProducts({
  categoryId,
  brandId,
  isBranded,
  currentProductId,
  brandName,
  categoryLabel
}: RelatedProductsProps) {
  const start = Date.now();
  
  const relatedFilter = new URLSearchParams({
    limit: '5',
    ...(isBranded && brandId 
      ? { brand_id: brandId.toString() } 
      : { category_id: categoryId.toString() })
  });
  
  const { products: relatedRaw } = await fetchProducts(relatedFilter);
  const relatedProducts = relatedRaw.filter(p => p.id !== currentProductId).slice(0, 4);
  

  if (relatedProducts.length === 0) return null;

  return (
    <section className="mt-14">
      <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">
         {isBranded ? `More from ${brandName}` : `More ${categoryLabel || 'Products'}`}
      </span>
      <h2 className="font-serif text-2xl md:text-3xl text-white mb-6">
        {isBranded ? `More from ${brandName}` : `Explore More ${categoryLabel || 'Products'}`}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map(p => (
          <RelatedCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <section className="mt-14 animate-pulse">
      <div className="h-3 w-32 bg-white/10 mb-3 rounded-full" />
      <div className="h-8 w-64 bg-white/10 mb-6 rounded-md" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="aspect-[3/4] bg-white/5 border border-white/10 rounded-lg" />
        ))}
      </div>
    </section>
  );
}
