import React, { useState, useEffect } from 'react';
import { optimizedImageUrl } from '../utils/imageOptimizer';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    aspectRatio?: string; // e.g. "3/4"
}

/**
 * Amazon/Flipkart scale Image Component
 * - Prevents CLS (Cumulative Layout Shift)
 * - Progressive Loading
 * - Optimized for Textile textures
 */
export const OptimizedImage: React.FC<OptimizedImageProps & { priority?: boolean }> = ({
    src,
    alt,
    className = "",
    aspectRatio = "3/4",
    priority,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(priority ? true : false);
    const [error, setError] = useState(src ? false : true);

    // Use state to handle fresh loads vs cached loads
    useEffect(() => {
        // Skip effect for priority images as they use native eager loading
        if (priority) return;

        // Only attempt to load if src is provided
        if (src) {
            const img = new Image();
            img.src = src;
            img.onload = () => setIsLoaded(true);
            img.onerror = () => setError(true);
        }
    }, [src, priority]);

    if (!src) {
        return (
            <div
                className={`relative overflow-hidden bg-neutral-900 ${className}`}
                style={{ aspectRatio }}
            >
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-white/20 text-[10px] uppercase tracking-tighter">
                    No Image
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative overflow-hidden bg-neutral-900 ${className}`}
            style={{ aspectRatio }}
        >
            {/* Skeleton / Placeholder */}
            {!isLoaded && !error && (
                <div className="absolute inset-0 animate-pulse bg-white/5" />
            )}

            {/* Actual Image */}
            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-contain transition-opacity duration-300 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                {...props}
            />

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-white/20 text-[10px] uppercase tracking-tighter">
                    No Image
                </div>
            )}
        </div>
    );
};
