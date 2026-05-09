'use client';

import React from 'react';
import { useCurrency } from './CurrencyContext';

interface ProductPriceProps {
  price: number;
  className?: string;
}

export const ProductPrice: React.FC<ProductPriceProps> = ({ price, className }) => {
  const { formatPrice } = useCurrency();
  return <span className={className}>{formatPrice(price)}</span>;
};
