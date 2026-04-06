import React, { useRef } from 'react';
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
 * - Debounced 120ms on mouseenter to prevent click lag on laptop from rapid hover events
 * - One-time prefetch guard — avoids repeated heavy work on re-hover
 */
export const SmartLink: React.FC<SmartLinkProps> = ({
    prefetchType = 'none',
    prefetchId,
    targetComponent,
    onMouseEnter,
    onMouseLeave,
    onTouchStart,
    children,
    ...props
}) => {
    const { prefetchProduct, prefetchCategories, prefetchSubCategories } = usePrefetchData();
    const queryClient = useQueryClient();
    const prefetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasPrefetched = useRef(false);

    const handlePrefetch = () => {
        // Only prefetch once per mounted instance to avoid repeated heavy image loads
        if (hasPrefetched.current) return;
        hasPrefetched.current = true;

        // 1. Prefetch Data
        if (prefetchType === 'product' && prefetchId) {
            prefetchProduct(prefetchId);

            // Prefetch product IMAGES into browser cache
            const allProductsQueries = queryClient.getQueriesData<Product[]>({ queryKey: ['products'] });
            for (const [_, data] of allProductsQueries) {
                const found = data?.find(p => p.id === prefetchId);
                if (found?.images) {
                    // Preload FIRST image at high-res (main) — critical for perceived speed
                    const firstImg = new Image();
                    firstImg.src = optimizedImageUrl(found.images[0], 'main');

                    // Preload FIRST image at tiny-res (LQIP)
                    const tinyImg = new Image();
                    tinyImg.src = optimizedImageUrl(found.images[0], 'tiny');

                    // Preload ALL images at thumbnail size (lightweight)
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
                // Debounce: only trigger prefetch after 120ms of genuine hover
                // This prevents jank from rapid mouse movement across product cards on laptop
                if (prefetchTimer.current) clearTimeout(prefetchTimer.current);
                prefetchTimer.current = setTimeout(handlePrefetch, 120);
                if (onMouseEnter) onMouseEnter(e);
            }}
            onMouseLeave={(e) => {
                // Cancel prefetch if mouse leaves before debounce fires (just passing through)
                if (prefetchTimer.current) clearTimeout(prefetchTimer.current);
                if (onMouseLeave) onMouseLeave(e);
            }}
            onTouchStart={(e) => {
                // On touch, prefetch immediately (no debounce needed)
                handlePrefetch();
                if (onTouchStart) onTouchStart(e);
            }}
        >
            {children}
        </Link>
    );
};
