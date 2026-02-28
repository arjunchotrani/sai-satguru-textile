import { DEPLOYMENT_CONFIG } from "./deploymentConfig";

export const generateAdminWhatsAppText = (product: {
  id: string;
  name: string;
  description: string;
  brand?: string;
}) => {
  const productUrl = `${DEPLOYMENT_CONFIG.WEBSITE_URL}/p/${product.id}`;

  return `
🌟 Sai Satguru Textile – Surat 🌟

🧵 Product: ${product.name}
${product.brand && product.brand !== "Generic" ? `🏷️ Brand: ${product.brand}\n` : ""}${product.description}

📦 *Wholesale Only* - MOQ Applies
⚠️ Prices Exclude GST and subject to change

🔗 View product:
${productUrl}

🚚 Fast dispatch from Surat

📲 For orders & enquiry:
${DEPLOYMENT_CONFIG.BUSINESS_PHONE}
`.trim();
};
