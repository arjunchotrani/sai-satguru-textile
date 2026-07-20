type ImageSize = 'tiny' | 'thumbnail' | 'card' | 'main' | 'full';

export function optimizedImageUrl(url: string | undefined, _size: ImageSize = 'main'): string {
    if (!url) return '';

    // Normalize R2 URLs missing protocol
    if (url.startsWith('pub-') || url.startsWith('r2.')) {
        return `https://${url}`;
    }

    return url;
}
