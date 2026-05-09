'use client';

import React from "react";
import { SmartLink } from "./SmartLink";
import type { Product } from "../lib/types";
import { useCurrency } from "./CurrencyContext";
import { OptimizedImage } from "./OptimizedImage";
import { optimizedImageUrl } from '../lib/imageOptimizer';
import { normalizeSlug } from '../lib/api';

interface Props {

  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<Props> = ({ product, priority = false }) => {
  const { formatPrice } = useCurrency();

  const rawUrl = product.images && product.images.length > 0
    ? product.images[0]
    : "";
    
  let normalized = rawUrl;
  if (rawUrl.startsWith('pub-') || rawUrl.startsWith('r2.')) {
    normalized = `https://${rawUrl}`;
  }
  
  const imageUrl = optimizedImageUrl(normalized, 'card');

  const slug = normalizeSlug(product.slug);
  const href = `/product/${slug}`;

  return (
    <SmartLink
      href={href}
      className="group relative bg-[#0a0a0a] overflow-hidden block cursor-pointer product-card-hover"
    >

      <OptimizedImage
        src={imageUrl}
        alt={product.name}
        priority={priority}
      />

      <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/90 line-clamp-1 mb-1">
          {product.name}
        </h3>

        <p className="text-[#d4af37] font-bold text-xs md:text-sm">
          {formatPrice(product.basePriceINR)}
        </p>
      </div>
    </SmartLink>
  );
};
