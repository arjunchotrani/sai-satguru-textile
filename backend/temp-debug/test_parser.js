const description = `Zeel Clothing presents new catalog of Sarees: Floral Sarees Vol-1. Catalog includes SKU 1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, and 1109 with rate 1500/- each. Total 9 Colours available. GST 5% EXTRA. Shipping extra.

KEY DETAILS
- Brand: Zeel Clothing
- Catalog: Floral Sarees Vol-1
- Product Type: Sarees
- Total Colours: 9
- SKU: 1101
- Rate: 1500/-
- SKU: 1102
- Rate: 1500/-`;

function parseProductDescription(description) {
  if (!description) return null;

  const lines = description.split('\n')
    .map(l => l.replace(/[\*_~]/g, '').trim())
    .filter(Boolean);

  const details = {
    overviewItems: []
  };

  lines.forEach(line => {
    const upper = line.toUpperCase();
    const divider = line.includes(':') ? ':' : (line.includes(' – ') ? ' – ' : (line.includes(' - ') ? ' - ' : ''));
    const parts = divider ? line.split(divider) : [line];
    const key = parts[0].trim();
    const keyUpper = key.toUpperCase().replace(/[^A-Z]/g, '');

    // The improved logic
    const isBadge = upper.includes('CODE-') || upper.includes('PRICE-') || 
                    upper.startsWith('CODE:') || upper.startsWith('PRICE:') || 
                    upper.startsWith('SKU:') || upper.startsWith('RATE:') ||
                    upper.startsWith('- SKU:') || upper.startsWith('- RATE:');

    if (isBadge) {
      details.overviewItems.push({ type: 'badge', content: line.replace(/^- /, '') });
    } else {
      details.overviewItems.push({ type: 'text', content: line });
    }
  });

  return details;
}

const result = parseProductDescription(description);
console.log(JSON.stringify(result.overviewItems.filter(i => i.type === 'badge'), null, 2));
