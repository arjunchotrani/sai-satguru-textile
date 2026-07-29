type ImageSize = 'tiny' | 'thumbnail' | 'card' | 'main' | 'full';

const SIZE_WIDTHS: Record<ImageSize, number> = {
  tiny: 40,        // blur placeholder
  thumbnail: 160,  // thumb strip: h-14/h-20 = 42–60px rendered, covers 2× DPR
  card: 400,       // product card grid
  main: 1200,      // gallery hero
  full: 1600,      // lightbox
};

export function optimizedImageUrl(url: string | undefined, size: ImageSize = 'main'): string {
  if (!url) return '';

  let src = url;
  if (url.startsWith('pub-') || url.startsWith('r2.')) {
    src = `https://${url}`;
  }

  if (src.startsWith('https://wsrv.nl/')) return src;

  const w = SIZE_WIDTHS[size];
  return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${w}&q=72&output=webp&we`;
}
