/**
 * Image Optimization Utility
 * Uses wsrv.nl (free, fast CDN) to resize, compress, and convert images to WebP on-the-fly.
 * 
 * Original: https://pub-xxx.r2.dev/photo.jpg (3MB, 3000px)
 * Optimized: https://wsrv.nl/?url=...&w=800&q=80&output=webp (80KB, 800px)
 */

type ImageSize = 'tiny' | 'thumbnail' | 'card' | 'main' | 'full';

const SIZE_CONFIG: Record<ImageSize, { width: number; quality: number }> = {
    tiny: { width: 50, quality: 30 },        // Ultra-low res for blurred placeholders
    thumbnail: { width: 150, quality: 60 },   // Reduced quality for thumbnails
    card: { width: 350, quality: 75 },
    main: { width: 600, quality: 75 },        // Reduced from 700 and 80% quality
    full: { width: 1200, quality: 80 },       // Reduced from 1400 and 85% quality
};

/**
 * Returns an optimized image URL via wsrv.nl proxy.
 * @param url - Original image URL (R2, etc.)
 * @param size - Preset size: 'thumbnail', 'card', 'main', or 'full'
 */
export function optimizedImageUrl(url: string | undefined, size: ImageSize = 'main'): string {
    if (!url) return '';

    // Normalize R2 URLs missing protocol
    let normalizedUrl = url;
    if (url.startsWith('pub-') || url.startsWith('r2.')) {
        normalizedUrl = `https://${url}`;
    }

    // Only optimize http(s) URLs and skip local environments
    if (!normalizedUrl.startsWith('http') || normalizedUrl.includes('localhost') || normalizedUrl.includes('127.0.0.1')) {
        return normalizedUrl;
    }

    const { width, quality } = SIZE_CONFIG[size];

    // wsrv.nl params: w=width, q=quality, output=webp, n=-1 (no upscale)
    return `https://wsrv.nl/?url=${encodeURIComponent(normalizedUrl)}&w=${width}&q=${quality}&output=webp&n=-1`;
}
