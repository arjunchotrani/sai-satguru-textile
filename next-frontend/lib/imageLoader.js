export default function imageLoader({ src, width, quality }) {
  const q = quality || 72;
  return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${width}&q=${q}&output=webp&we`;
}
