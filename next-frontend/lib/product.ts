import { Product, Category } from './types';

export const GLOBAL_NOTES = [
  "GST and shipping charges are extra on the listed prices.",
  "Slight color variation may occur due to lighting and flash during the photoshoot.",
  "Suitable for wholesale supply, boutique sourcing, and party wear saree collections."
];

const GENERIC_BRAND_VALUES = new Set(['generic', 'GENERIC', 'Generic', '', 'null', 'undefined']);

export function isGenericProduct(brandName?: string | null): boolean {
  if (!brandName) return true;
  return GENERIC_BRAND_VALUES.has(brandName.trim());
}

export function toDisplayCase(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

export function buildProductSeoTitle(
  productName: string,
  brandName?: string | null,
  categoryLabel?: string | null
): string {
  const isGeneric = isGenericProduct(brandName);
  const catPart = categoryLabel ? `${categoryLabel} ` : '';
  if (isGeneric) {
    return `${productName} | ${catPart}Wholesale`;
  }
  return `${productName} | ${brandName}`;
}

export function buildProductSeoDesc(
  productName: string,
  brandName?: string | null,
  categoryLabel?: string | null,
  rawDescription?: string | null
): string {
  const isGeneric = isGenericProduct(brandName);
  const cat = categoryLabel || 'textile';

  if (isGeneric) {
    return `Explore ${productName} — a ${cat.toLowerCase()} catalogue product available for wholesale enquiry at Sai Satguru Textile, Surat. Contact us on WhatsApp for pricing and availability.`;
  }
  const cleanDesc = rawDescription
    ? rawDescription.replace(/\n/g, ' ').replace(/[*_~]/g, '').trim().substring(0, 70)
    : '';
  const descPart = cleanDesc ? ` ${cleanDesc}.` : '';
  return `Explore ${productName} by ${brandName} at Sai Satguru Textile.${descPart} Wholesale ${cat.toLowerCase()} sourcing from Surat — enquire via WhatsApp.`;
}

export interface ParsedProductDetails {
  title: string;
  brand: string;
  catalog: string;
  type: string;
  keywords: string;
  gst: string;
  shipping: string;
  notes: string[];
  overviewItems: { type: 'badge' | 'header' | 'text'; content: string }[];
}

export function parseProductDescription(description?: string): ParsedProductDetails | null {
  if (!description) return null;

  const lines = description.split('\n')
    .map(l => l.replace(/[\*_~]/g, '').trim())
    .filter(Boolean);

  const details: ParsedProductDetails = {
    title: lines[0] || '',
    brand: '',
    catalog: '',
    type: '',
    keywords: '',
    gst: '',
    shipping: '',
    notes: [],
    overviewItems: []
  };

  let inNotes = false;

  lines.forEach(line => {
    const upper = line.toUpperCase();

    if (upper === 'NOTES:' || upper === 'NOTES' || upper.startsWith('NOTES ')) {
      inNotes = true;
      return;
    }

    const divider = line.includes(':') ? ':' : (line.includes(' – ') ? ' – ' : (line.includes(' - ') ? ' - ' : ''));
    const parts = divider ? line.split(divider) : [line];
    const key = parts[0].trim();
    const val = parts.slice(1).join(divider).trim();
    const keyUpper = key.toUpperCase().replace(/[^A-Z]/g, '');
    const hasDivider = !!divider && key.length < 25;

    if (hasDivider || parts.length === 1) {
      if (keyUpper === 'BRAND') {
        details.brand = val || '';
        return;
      }
      if (keyUpper === 'CATALOG' || keyUpper === 'CATALOGUE') {
        details.catalog = val || '';
        return;
      }
      if (keyUpper === 'KEYWORDS') {
        details.keywords = val || '';
        return;
      }
      if (keyUpper === 'GST') {
        details.gst = val || line.replace(/GST/i, '').trim();
        return;
      }
      if (keyUpper === 'SHIPPING') {
        details.shipping = val || line.replace(/SHIPPING/i, '').trim();
        return;
      }
      if (keyUpper === 'TYPE') {
        details.type = val || '';
        return;
      }
    }

    const isShortLine = line.length < 100;
    if (inNotes || ((keyUpper === 'NOTE' || keyUpper === 'IMPORTANT') && isShortLine)) {
      details.notes.push(line.replace(/^- /, ''));
      return;
    }

    const cleanUpper = upper.replace(/^- /, '').trim();
    const isBadge = cleanUpper.includes('CODE-') || 
                    cleanUpper.includes('PRICE-') || 
                    cleanUpper.startsWith('CODE:') || 
                    cleanUpper.startsWith('PRICE:') || 
                    cleanUpper.startsWith('SKU:') || 
                    cleanUpper.startsWith('SKU CODE:') ||
                    cleanUpper.startsWith('COLOR:') ||
                    cleanUpper.startsWith('COLOUR:') ||
                    cleanUpper.startsWith('RATE:');

    if (isBadge) {
      details.overviewItems.push({ type: 'badge', content: line.replace(/^- /, '') });
    }
    else if (isShortLine && !hasDivider && (upper === 'DETAILS' || upper === 'PRODUCT DESCRIPTION' || upper === 'KEY DETAILS' || upper === 'DESCRIPTION' || (parts.length === 1 && line.length < 25 && line.toUpperCase() === line))) {
      details.overviewItems.push({ type: 'header', content: line });
    }
    else {
      details.overviewItems.push({ type: 'text', content: line });
    }
  });

  GLOBAL_NOTES.forEach(gNote => {
    const exists = details.notes.some(n => n.toLowerCase().includes(gNote.toLowerCase().substring(0, 15)));
    if (!exists) details.notes.push(gNote);
  });

  return details;
}
