import React from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    aspectRatio?: string; // e.g. "3/4"
    priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = "",
    aspectRatio = "3/4",
    priority = false,
}) => {
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

    // Next.js config optimization over wsrv.nl proxy URL
    // We can rely entirely on standard unoptimized next/image OR use the precomputed image URL as src
    return (
        <div
            className={`relative overflow-hidden bg-neutral-900 ${className}`}
            style={{ aspectRatio }}
        >
            <Image
                src={src}
                alt={alt}
                fill
                className={`object-contain`}
                loading={priority ? "eager" : "lazy"}
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized // Use wsrv.nl's output directly instead of passing through _next/image processing to save Vercel/Cloudflare compute
            />
        </div>
    );
};
