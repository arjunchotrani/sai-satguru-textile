'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    aspectRatio?: string;
    priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = "",
    aspectRatio = "3/4",
    priority = false,
}) => {
    const [errored, setErrored] = useState(false);

    if (!src || errored) {
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
            <Image
                src={src}
                alt={alt}
                fill
                unoptimized
                className="object-contain"
                priority={priority}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                onError={() => setErrored(true)}
            />
        </div>
    );
};
