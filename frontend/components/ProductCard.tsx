import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { SmartLink } from "./SmartLink";
import type { Product } from "../types";
import { useCurrency } from "./CurrencyContext";
import { OptimizedImage } from "./OptimizedImage";
import { optimizedImageUrl } from '../utils/imageOptimizer';

interface Props {
  product: Product;
  priority?: boolean;
}

function normalizeImageUrl(url?: string) {
  if (!url) return "";

  // ✅ Fix R2 URLs missing protocol
  if (url.startsWith("pub-") || url.startsWith("r2.")) {
    return `https://${url}`;
  }

  if (url.startsWith("http")) {
    return url;
  }

  // Handle absolute paths starting with /
  if (url.startsWith("/")) {
    return url;
  }

  return "";
}

export const ProductCard: React.FC<Props> = ({ product, priority = false }) => {
  const { formatPrice } = useCurrency();

  const imageUrl = useMemo(() => {
    const rawUrl = product.images && product.images.length > 0
      ? product.images[0]
      : "";
    // Normalize R2 URLs first
    let normalized = rawUrl;
    if (rawUrl.startsWith('pub-') || rawUrl.startsWith('r2.')) {
      normalized = `https://${rawUrl}`;
    }
    return optimizedImageUrl(normalized, 'card');
  }, [product.images]);

  return (
    <SmartLink
      to={`/product/${product.id}`}
      prefetchType="product"
      prefetchId={product.id}
      targetComponent={() => import("../pages/ProductDetail")}
      className="group relative bg-[#0a0a0a] border border-white/5 overflow-hidden block hover:border-brand-gold/50 transition-colors"
    >
      <OptimizedImage
        src={imageUrl}
        alt={product.name}
        priority={priority}
      />

      <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/90 line-clamp-1 mb-1">
          {product.name}
        </h3>

        <p className="text-brand-gold font-bold text-xs md:text-sm">
          {formatPrice(product.basePriceINR)}
        </p>
      </div>
    </SmartLink>
  );
};
