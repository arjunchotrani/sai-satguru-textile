export default function imageLoader({ src, width, quality }) {
  const q = quality || 72;
  // Local /public assets (e.g. static hero images) — serve directly, wsrv.nl
  // can't proxy a relative path since it has no host to fetch from.
  if (src.startsWith('/')) {
    return src;
  }
  if (src.startsWith('https://wsrv.nl/')) {
    // Already routed through wsrv.nl — update w/q to Next.js-computed values
    const url = new URL(src);
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(q));
    return url.toString();
  }
  return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${width}&q=${q}&output=webp&we`;
}
