import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { usePrefetchData } from '../hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { optimizedImageUrl } from '../utils/imageOptimizer';
import type { Product } from '../types';

interface SmartLinkProps extends LinkProps {
    prefetchType?: 'product' | 'category' | 'none';
    prefetchId?: string;
    targetComponent?: () => Promise<any>;
}

/**
 * SmartLink Component:
 * - Prefetches API data into React Query cache
 * - Prefetches JS chunks for the target page
 * - Triggers on MouseEnter (Desktop) and TouchStart (Mobile)
 */
export const SmartLink: React.FC<SmartLinkProps> = ({
    prefetchType = 'none',
    prefetchId,
    targetComponent,
    onMouseEnter,
    onTouchStart,
    children,
    ...props
}) => {
    const { prefetchProduct, prefetchCategories, prefetchSubCategories } = usePrefetchData();
    const queryClient = useQueryClient();

    const handlePrefetch = () => {
        // 1. Prefetch Data
        if (prefetchType === 'product' && prefetchId) {
            prefetchProduct(prefetchId);

            // 3. Prefetch product IMAGES into browser cache
            const allProductsQueries = queryClient.getQueriesData<Product[]>({ queryKey: ['products'] });
            for (const [_, data] of allProductsQueries) {
                const found = data?.find(p => p.id === prefetchId);
                if (found?.images) {
                    // 1. Preload FIRST image at high-res (main) - Critical for perceived speed
                    const firstImg = new Image();
                    firstImg.src = optimizedImageUrl(found.images[0], 'main');

                    // 2. Preload FIRST image at tiny-res (LQIP)
                    const tinyImg = new Image();
                    tinyImg.src = optimizedImageUrl(found.images[0], 'tiny');

                    // 3. Preload ALL images at thumbnail size (lightweight)
                    found.images.forEach(url => {
                        const thumb = new Image();
                        thumb.src = optimizedImageUrl(url, 'thumbnail');
                    });
                    break;
                }
            }
        } else if (prefetchType === 'category') {
            prefetchCategories();
            if (prefetchId) prefetchSubCategories(prefetchId);
        }

        // 2. Prefetch Code (JS Chunk)
        if (targetComponent) {
            targetComponent();
        }
    };

    return (
        <Link
            {...props}
            onMouseEnter={(e) => {
                handlePrefetch();
                if (onMouseEnter) onMouseEnter(e);
            }}
            onTouchStart={(e) => {
                handlePrefetch();
                if (onTouchStart) onTouchStart(e);
            }}
        >
            {children}
        </Link>
    );
};
